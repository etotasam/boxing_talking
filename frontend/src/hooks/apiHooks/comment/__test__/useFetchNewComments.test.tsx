import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { useFetchNewComments } from '@/hooks/apiHooks/comment';
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

describe('useFetchNewComments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('初期表示では新着コメント取得 API を呼び出さない', () => {
    const { result } = renderHook(
      () => useFetchNewComments({ matchId: 1, createdAt: '2024-03-12 03:58:00' }),
      { wrapper: createWrapper() }
    );

    expect(mocks.get).not.toHaveBeenCalled();
    expect(result.current.newCommentFetchState).toBe('idle');
  });

  test('refetch 時に指定日時以降の新着コメントを取得して返す', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce(commentsResponse);

    const { result } = renderHook(
      () => useFetchNewComments({ matchId: 1, createdAt: '2024-03-12 03:58:00' }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.COMMENT_NEW, {
        params: {
          matchId: 1,
          createdAt: '2024-03-12 03:58:00',
        },
      });
      expect(result.current.data).toEqual([comment]);
      expect(result.current.newCommentFetchState).toBe('idle');
    });
  });

  test('createdAt が null の時は補完した日時で新着コメントを取得する', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce(commentsResponse);

    const { result } = renderHook(() => useFetchNewComments({ matchId: 1, createdAt: null }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.COMMENT_NEW, {
        params: {
          matchId: 1,
          createdAt: expect.any(String),
        },
      });
    });
  });

  test('新着コメント取得に失敗した時は error 状態を返す', async () => {
    vi.mocked(Axios.get).mockRejectedValueOnce(new Error('failed'));

    const { result } = renderHook(
      () => useFetchNewComments({ matchId: 1, createdAt: '2024-03-12 03:58:00' }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.newCommentFetchState).toBe('error');
    });
  });
});
