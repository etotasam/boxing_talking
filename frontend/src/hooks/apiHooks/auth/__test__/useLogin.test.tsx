import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useLogin } from '@/hooks/apiHooks/auth';
import type { UserType } from '@/types';

const noop = () => undefined;

setLogger({
  log: noop,
  warn: noop,
  error: noop,
});

const mocks = vi.hoisted(() => {
  return {
    post: vi.fn(),
    get: vi.fn(),
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
      get: mocks.get,
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

vi.mock('@/hooks/apiHooks/useWinLossPrediction', () => {
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

type LoginInput = {
  email: string;
  password: string;
};

const input: LoginInput = {
  email: 'test@example.com',
  password: 'Password1',
};

const userData: UserType = {
  name: 'test user',
};

// QueryClientProvider 付きの hook テスト用 wrapper を生成する関数
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

// useLogin を共通条件で renderHook する関数
const renderUseLogin = () => {
  return renderHook(() => useLogin(), { wrapper: createWrapper() });
};

// 共通の入力値で login を実行する関数
const executeLogin = (login: (props: LoginInput) => void) => {
  act(() => {
    login(input);
  });
};

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('login成功時に認証キャッシュ更新と関連副作用を実行する', async () => {
    vi.mocked(Axios.get).mockResolvedValue({ data: true });
    vi.mocked(Axios.post).mockResolvedValueOnce({
      data: {
        data: userData,
      },
    });

    const { result } = renderUseLogin();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.ADMIN);
    });

    mocks.get.mockClear();

    executeLogin(result.current.login);

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledWith(API_PATH.USER_LOGIN, input);
      expect(mocks.refetchMatchPrediction).toHaveBeenCalledTimes(1);
      expect(mocks.hideLoginModal).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.ADMIN);
      expect(mocks.setReactQueryData).toHaveBeenCalledTimes(1);
      expect(mocks.setReactQueryData).toHaveBeenCalledWith(QUERY_KEY.AUTH, userData);
      expect(mocks.showSuccessToast).toHaveBeenCalledTimes(1);
      expect(mocks.showSuccessToast).toHaveBeenCalledWith(MESSAGE.LOGIN_SUCCESS);
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('login失敗時はローディングを閉じて失敗トーストを表示する', async () => {
    vi.mocked(Axios.get).mockResolvedValue({ data: true });
    vi.mocked(Axios.post).mockRejectedValueOnce(new Error('login failed'));

    const { result } = renderUseLogin();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.ADMIN);
    });

    mocks.get.mockClear();

    executeLogin(result.current.login);

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.LOGIN_FAILED);
      expect(mocks.showSuccessToast).not.toHaveBeenCalled();
      expect(mocks.hideLoginModal).not.toHaveBeenCalled();
      expect(mocks.refetchMatchPrediction).not.toHaveBeenCalled();
      expect(mocks.setReactQueryData).not.toHaveBeenCalled();
      expect(mocks.get).not.toHaveBeenCalled();
    });
  });
});
