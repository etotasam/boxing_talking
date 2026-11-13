import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { describe, expect, test, vi } from 'vitest';
import { useReactQuery } from '../useReactQuery';

const setup = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useReactQuery', () => {
  test('文字列引数で認証キャッシュを読み書きし、別キーのキャッシュを維持する', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['auth'], { name: 'before' });
    queryClient.setQueryData(['guest'], true);
    const { result } = renderHook(() => useReactQuery(), { wrapper: setup(queryClient) });

    act(() => result.current.setReactQueryData('auth', { name: 'after' }));
    expect(result.current.getReactQueryData('auth')).toEqual({ name: 'after' });
    expect(queryClient.getQueryData(['guest'])).toBe(true);
  });

  test('文字列キーで該当する複合キーの一覧を再取得し、別の一覧は再取得しない', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    const fetchBoxers = vi.fn().mockResolvedValue(['boxer']);
    const fetchMatches = vi.fn().mockResolvedValue(['match']);
    const { result } = renderHook(
      () => {
        useQuery({ queryKey: ['boxer', { page: 1 }], queryFn: fetchBoxers });
        useQuery({ queryKey: ['matches'], queryFn: fetchMatches });
        return useReactQuery();
      },
      { wrapper: setup(queryClient) }
    );
    await waitFor(() =>
      expect(queryClient.getQueryData(['boxer', { page: 1 }])).toEqual(['boxer'])
    );

    act(() => result.current.refetchReactQueryData('boxer'));
    await waitFor(() => expect(fetchBoxers).toHaveBeenCalledTimes(2));
    expect(fetchMatches).toHaveBeenCalledTimes(1);

    act(() => result.current.refetchReactQueryArrayKeys(['boxer', 'matches']));
    await waitFor(() => {
      expect(fetchBoxers).toHaveBeenCalledTimes(3);
      expect(fetchMatches).toHaveBeenCalledTimes(2);
    });
  });
});
