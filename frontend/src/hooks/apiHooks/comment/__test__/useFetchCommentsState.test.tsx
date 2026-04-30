import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { useFetchCommentsState } from '@/hooks/apiHooks/comment';
import { createWrapper } from './testUtils';

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

describe('useFetchCommentsState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('コメント状態取得 API から maxPage と最新投稿時刻を取得して返す', async () => {
    const response = {
      maxPage: 2,
      resentPostTime: '2024-03-12 03:58:00',
    };
    vi.mocked(Axios.get).mockResolvedValueOnce({
      data: response,
    });

    const { result } = renderHook(() => useFetchCommentsState(1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.COMMENT_STATE, {
        params: {
          matchId: 1,
          limit: 10,
        },
      });
      expect(result.current.data).toEqual(response);
      expect(result.current.isError).toBe(false);
    });
  });

  test('コメント状態取得に失敗した時は error 状態を返す', async () => {
    vi.mocked(Axios.get).mockRejectedValueOnce(new Error('failed'));

    const { result } = renderHook(() => useFetchCommentsState(1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(result.current.isError).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });
});
