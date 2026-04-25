import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { useGuest } from '@/hooks/apiHooks/auth';

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
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

// useGuest を共通条件で renderHook する関数
const renderUseGuest = () => {
  return renderHook(() => useGuest(), { wrapper: createWrapper() });
};

describe('useGuest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('API が truthy response を返した時は true を返す', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce({
      data: {
        guest: 'exists',
      },
    });

    const { result } = renderUseGuest();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.GUEST);
      expect(result.current.data).toBe(true);
      expect(result.current.isError).toBe(false);
    });
  });

  test('API 例外時は false を返す', async () => {
    vi.mocked(Axios.get).mockRejectedValueOnce(new Error('guest check failed'));

    const { result } = renderUseGuest();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.GUEST);
      expect(result.current.data).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });
});
