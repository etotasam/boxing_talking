import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useFetchCommentsOld } from '@/hooks/apiHooks/comment';
import { commentsResponse, createWrapper, comment } from './testUtils';

const mocks = vi.hoisted(() => {
  return {
    get: vi.fn(),
    showErrorToast: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      get: mocks.get,
    },
  };
});

vi.mock('@/hooks/useToastModal', () => {
  return {
    useToastModal: vi.fn(() => {
      return {
        showErrorToast: mocks.showErrorToast,
      };
    }),
  };
});

describe('useFetchCommentsOld', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('旧コメント取得 API からコメントを取得して成功状態を返す', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce(commentsResponse);

    const { result } = renderHook(() => useFetchCommentsOld(1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.COMMENT_OLD, {
        params: {
          matchId: 1,
        },
      });
      expect(result.current.data).toEqual([comment]);
      expect(result.current.commentFetchState).toBe('success');
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('セッション切れで取得に失敗した時はセッション切れトーストを表示する', async () => {
    vi.mocked(Axios.get).mockRejectedValueOnce({ status: 419 });

    const { result } = renderHook(() => useFetchCommentsOld(1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.commentFetchState).toBe('error');
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.SESSION_EXPIRED);
    });
  });
});
