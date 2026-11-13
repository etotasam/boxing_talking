import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useFetchUsersPrediction } from '../useFetchUsersPrediction';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  auth: vi.fn(),
  guest: vi.fn(),
}));

vi.mock('@/api/axios', () => ({ Axios: { get: mocks.get } }));
vi.mock('../../auth/useAuth', () => ({ useAuth: mocks.auth }));
vi.mock('../../auth/useGuest', () => ({ useGuest: mocks.guest }));

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, ...renderHook(() => useFetchUsersPrediction(), { wrapper }) };
};

describe('useFetchUsersPrediction', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.auth.mockReturnValue({ data: { name: 'user' } });
    mocks.guest.mockReturnValue({ data: false });
  });

  test('予想なしの null を正常に取得し、公開 data は undefined を維持する', async () => {
    mocks.get.mockResolvedValueOnce({ data: { data: null } });
    const { queryClient, result } = setup();

    await waitFor(() =>
      expect(queryClient.getQueryState([QUERY_KEY.PREDICTION])?.status).toBe('success')
    );
    expect(queryClient.getQueryData([QUERY_KEY.PREDICTION])).toBeNull();
    expect(result.current.data).toBeUndefined();
    expect(result.current.usePredictionFetchState).toBe('idle');
    expect(mocks.get).toHaveBeenCalledWith(API_PATH.PREDICTION);
  });

  test('未認証では取得せず、ログイン後に取得を開始する', async () => {
    mocks.auth.mockReturnValue({ data: null });
    mocks.get.mockResolvedValueOnce({ data: { data: [] } });
    const { result, rerender } = setup();
    expect(mocks.get).not.toHaveBeenCalled();
    expect(result.current.usePredictionFetchState).toBe('idle');

    mocks.auth.mockReturnValue({ data: { name: 'user' } });
    rerender();
    await waitFor(() => expect(result.current.data).toEqual([]));
    expect(mocks.get).toHaveBeenCalledTimes(1);
  });

  test('取得したユーザー予想をそのまま返す', async () => {
    const predictions = [{ id: 1, matchId: 10, prediction: 'red' }];
    mocks.get.mockResolvedValueOnce({ data: { data: predictions } });
    const { result } = setup();
    await waitFor(() => expect(result.current.data).toEqual(predictions));
  });

  test('ゲストでも取得し、初回取得中と再取得中の状態を区別する', async () => {
    mocks.auth.mockReturnValue({ data: null });
    mocks.guest.mockReturnValue({ data: true });
    let resolveFirst!: (value: { data: { data: [] } }) => void;
    let resolveNext!: (value: { data: { data: [] } }) => void;
    mocks.get
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveNext = resolve;
        })
      );
    const { result } = setup();
    expect(result.current.usePredictionFetchState).toBe('loading');

    await act(async () => {
      resolveFirst({ data: { data: [] } });
    });
    await waitFor(() => expect(result.current.usePredictionFetchState).toBe('idle'));
    let refetch!: ReturnType<typeof result.current.refetch>;
    act(() => {
      refetch = result.current.refetch();
    });
    await waitFor(() => expect(result.current.usePredictionFetchState).toBe('refetching'));
    await act(async () => {
      resolveNext({ data: { data: [] } });
      await refetch;
    });
    await waitFor(() => expect(result.current.usePredictionFetchState).toBe('idle'));
  });
});
