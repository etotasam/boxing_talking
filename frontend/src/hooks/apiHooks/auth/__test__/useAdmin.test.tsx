import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { useAdmin } from '@/hooks/apiHooks/auth';

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

// useAdmin を共通条件で renderHook する関数
const renderUseAdmin = () => {
  return renderHook(() => useAdmin(), { wrapper: createWrapper() });
};

describe('useAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('API が boolean を返した時は同じ値を isAdmin に入れる', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce({
      data: true,
    });

    const { result } = renderUseAdmin();

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.ADMIN);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isFetching).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  test('API が number の 1 を返した時は isAdmin に true を入れる', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce({
      data: 1,
    });

    const { result } = renderUseAdmin();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.ADMIN);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isError).toBe(false);
    });
  });

  test('API が number の 0 を返した時は isAdmin に false を入れる', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce({
      data: 0,
    });

    const { result } = renderUseAdmin();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  test('API が想定外の文字列を返した時は isAdmin に false を入れる', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce({
      data: 'true',
    });

    const { result } = renderUseAdmin();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  test('API が false を返した時は isAdmin に false を入れる', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce({
      data: false,
    });

    const { result } = renderUseAdmin();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.ADMIN);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  test('API 例外時は isError を true にする', async () => {
    vi.mocked(Axios.get).mockRejectedValueOnce(new Error('admin check failed'));

    const { result } = renderUseAdmin();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.ADMIN);
      expect(result.current.isAdmin).toBeUndefined();
      expect(result.current.isError).toBe(true);
      expect(result.current.isFetching).toBe(false);
    });
  });

  test('cached true の再取得中も isFetching を公開する', async () => {
    let resolveSecondRequest: (value: { data: boolean }) => void = () => undefined;
    vi.mocked(Axios.get)
      .mockResolvedValueOnce({ data: true })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecondRequest = resolve;
          })
      );

    const { result } = renderUseAdmin();
    await waitFor(() => expect(result.current.isAdmin).toBe(true));

    let refetchPromise: Promise<unknown> | undefined;
    act(() => {
      refetchPromise = result.current.refetch();
    });
    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.isAdmin).toBe(true);

    await act(async () => {
      resolveSecondRequest({ data: true });
      await refetchPromise;
    });
    await waitFor(() => expect(result.current.isFetching).toBe(false));
  });

  test('cached true の再取得が失敗した時は isError を公開する', async () => {
    vi.mocked(Axios.get)
      .mockResolvedValueOnce({ data: true })
      .mockRejectedValueOnce(new Error('refresh failed'));

    const { result } = renderUseAdmin();
    await waitFor(() => expect(result.current.isAdmin).toBe(true));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
      expect(result.current.isError).toBe(true);
    });
  });
});
