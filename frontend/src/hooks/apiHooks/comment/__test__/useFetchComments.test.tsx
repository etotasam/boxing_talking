import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { useFetchComments } from '@/hooks/apiHooks/comment';
import { commentsResponse, createWrapper, comment } from './testUtils';

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

describe('useFetchComments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('初期表示ではコメント取得 API を呼び出さない', () => {
    const { result } = renderHook(
      () => useFetchComments({ matchId: 1, createdAt: '2024-03-12 03:58:00', page: 1 }),
      { wrapper: createWrapper() }
    );

    expect(mocks.get).not.toHaveBeenCalled();
    expect(result.current.commentFetchState).toBe('idle');
  });

  test('refetch 時に指定条件でコメントを取得して返す', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce(commentsResponse);

    const { result } = renderHook(
      () => useFetchComments({ matchId: 1, createdAt: '2024-03-12 03:58:00', page: 2 }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.COMMENT, {
        params: {
          matchId: 1,
          createdAt: '2024-03-12 03:58:00',
          page: 2,
          limit: 10,
        },
      });
      expect(result.current.data).toEqual([comment]);
      expect(result.current.commentFetchState).toBe('idle');
    });
  });

  test('コメント取得に失敗した時は error 状態を返す', async () => {
    vi.mocked(Axios.get).mockRejectedValueOnce(new Error('failed'));

    const { result } = renderHook(
      () => useFetchComments({ matchId: 1, createdAt: '2024-03-12 03:58:00', page: 1 }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.commentFetchState).toBe('error');
    });
  });
});
