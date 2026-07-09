import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Axios } from '@/api/axios';
import { CUSTOM_ERROR_CODE } from '@/constants/customErrorCodes';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useGuestLogin } from '@/hooks/apiHooks/auth';

const noop = () => undefined;

setLogger({
  log: noop,
  warn: noop,
  error: noop,
});

const mocks = vi.hoisted(() => {
  return {
    post: vi.fn(),
    showErrorToast: vi.fn(),
    showSuccessToast: vi.fn(),
    showFullScreenLoading: vi.fn(),
    hideFullScreenLoading: vi.fn(),
    hideLoginModal: vi.fn(),
    refetchMatchPrediction: vi.fn(),
    setReactQueryData: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      post: mocks.post,
    },
  };
});

vi.mock('@/hooks/useToastModal', () => {
  return {
    useToastModal: vi.fn(() => {
      return {
        showErrorToast: mocks.showErrorToast,
        showSuccessToast: mocks.showSuccessToast,
      };
    }),
  };
});

vi.mock('@/hooks/useFullScreenLoading', () => {
  return {
    useFullScreenLoading: vi.fn(() => {
      return {
        showFullScreenLoading: mocks.showFullScreenLoading,
        hideFullScreenLoading: mocks.hideFullScreenLoading,
      };
    }),
  };
});

vi.mock('@/hooks/useLoginModal', () => {
  return {
    useLoginModal: vi.fn(() => {
      return {
        hideLoginModal: mocks.hideLoginModal,
      };
    }),
  };
});

vi.mock('@/hooks/apiHooks/prediction', () => {
  return {
    useFetchUsersPrediction: vi.fn(() => {
      return {
        refetch: mocks.refetchMatchPrediction,
      };
    }),
  };
});

vi.mock('@/hooks/useReactQuery', () => {
  return {
    useReactQuery: vi.fn(() => {
      return {
        setReactQueryData: mocks.setReactQueryData,
      };
    }),
  };
});

const usersPredictionCache = [{ matchId: 1, prediction: 'red' }];
const matchPredictionsCacheKey = [QUERY_KEY.MATCH_PREDICTIONS, { id: 1, userPrediction: 'red' }];
const matchPredictionsCache = { isVisible: true, totalVotes: 2, red: 1, blue: 1 };

// 共通の QueryClient を生成する関数
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// QueryClientProvider 付きの hook テスト用 wrapper を生成する関数
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

// useGuestLogin を共通条件で renderHook する関数
const renderUseGuestLogin = (queryClient: QueryClient) => {
  return renderHook(() => useGuestLogin(), { wrapper: createWrapper(queryClient) });
};

// 前ユーザーの勝敗予想キャッシュを投入する関数
const seedPredictionCaches = (queryClient: QueryClient) => {
  queryClient.setQueryData(QUERY_KEY.PREDICTION, usersPredictionCache);
  queryClient.setQueryData(matchPredictionsCacheKey, matchPredictionsCache);
};

describe('useGuestLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('guestLogin成功時にモーダルを閉じて関連副作用を実行する', async () => {
    vi.mocked(Axios.post).mockResolvedValueOnce({ data: {} });

    const queryClient = createQueryClient();
    seedPredictionCaches(queryClient);
    const { result } = renderUseGuestLogin(queryClient);

    act(() => {
      result.current.guestLogin();
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.hideLoginModal).toHaveBeenCalledTimes(1);
      expect(queryClient.getQueryData(QUERY_KEY.PREDICTION)).toBeUndefined();
      expect(queryClient.getQueryData(matchPredictionsCacheKey)).toBeUndefined();
      expect(mocks.refetchMatchPrediction).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.setReactQueryData).toHaveBeenCalledTimes(1);
      expect(mocks.setReactQueryData).toHaveBeenCalledWith(QUERY_KEY.GUEST, true);
      expect(mocks.showSuccessToast).toHaveBeenCalledTimes(1);
      expect(mocks.showSuccessToast).toHaveBeenCalledWith(MESSAGE.LOGIN_SUCCESS);
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('ゲスト生成上限エラー時は上限到達のエラートーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({
      data: {
        errorCode: CUSTOM_ERROR_CODE.UNABLE_TO_GENERATE_GUEST_TODAY,
      },
    });

    const queryClient = createQueryClient();
    seedPredictionCaches(queryClient);
    const { result } = renderUseGuestLogin(queryClient);

    act(() => {
      result.current.guestLogin();
    });

    await waitFor(() => {
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.NOT_CREATE_GUEST_BY_LIMIT);
      expect(queryClient.getQueryData(QUERY_KEY.PREDICTION)).toEqual(usersPredictionCache);
      expect(queryClient.getQueryData(matchPredictionsCacheKey)).toEqual(matchPredictionsCache);
      expect(mocks.showSuccessToast).not.toHaveBeenCalled();
      expect(mocks.hideLoginModal).not.toHaveBeenCalled();
      expect(mocks.setReactQueryData).not.toHaveBeenCalled();
    });
  });

  test('想定外エラー時はログイン失敗のエラートーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({
      data: {
        errorCode: 9999,
      },
    });

    const queryClient = createQueryClient();
    seedPredictionCaches(queryClient);
    const { result } = renderUseGuestLogin(queryClient);

    act(() => {
      result.current.guestLogin();
    });

    await waitFor(() => {
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.LOGIN_FAILED);
      expect(queryClient.getQueryData(QUERY_KEY.PREDICTION)).toEqual(usersPredictionCache);
      expect(queryClient.getQueryData(matchPredictionsCacheKey)).toEqual(matchPredictionsCache);
      expect(mocks.showSuccessToast).not.toHaveBeenCalled();
      expect(mocks.hideLoginModal).not.toHaveBeenCalled();
      expect(mocks.refetchMatchPrediction).not.toHaveBeenCalled();
    });
  });
});
