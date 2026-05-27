import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useLogout } from '@/hooks/apiHooks/auth';

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
    showGrayBackToast: vi.fn(),
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
        showGrayBackToast: mocks.showGrayBackToast,
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

type AuthUser = {
  name: string;
};

// QueryClientProvider 付きの hook テスト用 wrapper を生成する関数
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

// useLogout を共通条件で renderHook する関数
const renderUseLogout = (queryClient: QueryClient) => {
  return renderHook(() => useLogout(), { wrapper: createWrapper(queryClient) });
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

// 共通の初期認証キャッシュを投入する関数
const seedAuthCache = (queryClient: QueryClient) => {
  queryClient.setQueryData<AuthUser>(QUERY_KEY.AUTH, { name: 'test user' });
};

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('logout成功時に認証キャッシュ削除と関連副作用を実行する', async () => {
    vi.mocked(Axios.post).mockResolvedValueOnce({ data: undefined });

    const queryClient = createQueryClient();
    seedAuthCache(queryClient);
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderUseLogout(queryClient);

    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledWith(API_PATH.USER_LOGOUT);
      expect(queryClient.getQueryData(QUERY_KEY.AUTH)).toBeNull();
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith(QUERY_KEY.ADMIN);
      expect(mocks.refetchMatchPrediction).toHaveBeenCalledTimes(1);
      expect(mocks.showGrayBackToast).toHaveBeenCalledTimes(1);
      expect(mocks.showGrayBackToast).toHaveBeenCalledWith(MESSAGE.LOGOUT_SUCCESS);
      expect(mocks.hideMenuModal).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('logout失敗時は認証キャッシュを維持して失敗トーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce(new Error('logout failed'));

    const queryClient = createQueryClient();
    seedAuthCache(queryClient);
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderUseLogout(queryClient);

    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.LOGOUT_FAILED);
      expect(queryClient.getQueryData(QUERY_KEY.AUTH)).toEqual({ name: 'test user' });
      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
      expect(mocks.refetchMatchPrediction).not.toHaveBeenCalled();
      expect(mocks.showGrayBackToast).not.toHaveBeenCalled();
      expect(mocks.hideMenuModal).not.toHaveBeenCalled();
    });
  });
});
