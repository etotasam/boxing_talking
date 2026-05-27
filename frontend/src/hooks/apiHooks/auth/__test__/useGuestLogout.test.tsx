import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useGuestLogout } from '@/hooks/apiHooks/auth';

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
    hideMenuModal: vi.fn(),
    refetchMatchPrediction: vi.fn(),
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

vi.mock('@/hooks/useMenuModal', () => {
  return {
    useMenuModal: vi.fn(() => {
      return {
        hide: mocks.hideMenuModal,
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

// QueryClientProvider 付きの hook テスト用 wrapper を生成する関数
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

// useGuestLogout を共通条件で renderHook する関数
const renderUseGuestLogout = (queryClient: QueryClient) => {
  return renderHook(() => useGuestLogout(), { wrapper: createWrapper(queryClient) });
};

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

// 共通のゲスト状態キャッシュを投入する関数
const seedGuestCache = (queryClient: QueryClient) => {
  queryClient.setQueryData<boolean>(QUERY_KEY.GUEST, true);
};

describe('useGuestLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('guestLogout成功時にゲスト状態を解除して関連副作用を実行する', async () => {
    vi.mocked(Axios.post).mockResolvedValueOnce({ data: undefined });

    const queryClient = createQueryClient();
    seedGuestCache(queryClient);
    const { result } = renderUseGuestLogout(queryClient);

    act(() => {
      result.current.guestLogout();
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledWith(API_PATH.GUEST_LOGOUT);
      expect(mocks.refetchMatchPrediction).toHaveBeenCalledTimes(1);
      expect(queryClient.getQueryData(QUERY_KEY.GUEST)).toBe(false);
      expect(mocks.showSuccessToast).toHaveBeenCalledTimes(1);
      expect(mocks.showSuccessToast).toHaveBeenCalledWith(MESSAGE.LOGOUT_SUCCESS);
      expect(mocks.hideMenuModal).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('guestLogout失敗時はゲスト状態を維持して失敗トーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce(new Error('guest logout failed'));

    const queryClient = createQueryClient();
    seedGuestCache(queryClient);
    const { result } = renderUseGuestLogout(queryClient);

    act(() => {
      result.current.guestLogout();
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.LOGOUT_FAILED);
      expect(queryClient.getQueryData(QUERY_KEY.GUEST)).toBe(true);
      expect(mocks.refetchMatchPrediction).not.toHaveBeenCalled();
      expect(mocks.showSuccessToast).not.toHaveBeenCalled();
      expect(mocks.hideMenuModal).not.toHaveBeenCalled();
    });
  });
});
