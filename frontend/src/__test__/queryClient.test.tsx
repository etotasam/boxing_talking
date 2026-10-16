import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { onlineManager, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createQueryClient } from '../queryClient';

describe('アプリ共通の QueryClient 設定', () => {
  afterEach(() => {
    onlineManager.setOnline(true);
  });

  test('オフラインでも初回取得を試し、失敗時は保留せずエラー状態になる', async () => {
    onlineManager.setOnline(false);
    const queryClient = createQueryClient();
    const queryFn = vi.fn().mockRejectedValue(new Error('offline'));
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useQuery({ queryKey: ['offline-query'], queryFn }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(queryFn).toHaveBeenCalledTimes(1);
  });
});
