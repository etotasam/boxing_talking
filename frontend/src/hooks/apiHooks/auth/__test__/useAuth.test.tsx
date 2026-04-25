import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useAuth } from '@/hooks/apiHooks/auth';
import type { UserType } from '@/types';

const noop = () => undefined;

setLogger({
  log: noop,
  warn: noop,
  error: noop,
});

const mocks = vi.hoisted(() => {
  return {
    get: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      get: mocks.get,
    },
  };
});

// QueryClientProvider 付きの hook テスト用 wrapper を生成する関数
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

// 共通の QueryClient を生成する関数
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

// useAuth を共通条件で renderHook する関数
const renderUseAuth = (queryClient: QueryClient) => {
  return renderHook(() => useAuth(), { wrapper: createWrapper(queryClient) });
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('ユーザー取得成功時に user data を返す', async () => {
    const authUser: UserType = {
      name: 'test user',
    };
    vi.mocked(Axios.get).mockResolvedValueOnce({
      data: {
        data: authUser,
      },
    });

    const queryClient = createQueryClient();
    const { result } = renderUseAuth(queryClient);

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.USER);
      expect(result.current.data).toEqual(authUser);
      expect(result.current.isError).toBe(false);
      expect(queryClient.getQueryData(QUERY_KEY.AUTH)).toEqual(authUser);
    });
  });

  test('API が null を返した時は認証キャッシュを null で固定する', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce({
      data: {
        data: null,
      },
    });

    const queryClient = createQueryClient();
    const { result } = renderUseAuth(queryClient);

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.USER);
      expect(result.current.data).toBeNull();
      expect(result.current.isError).toBe(false);
      expect(queryClient.getQueryData(QUERY_KEY.AUTH)).toBeNull();
    });
  });
});
