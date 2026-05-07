import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useDeleteComment } from '@/hooks/apiHooks/comment';
import { createQueryClient, createWrapper } from './testUtils';

const mocks = vi.hoisted(() => {
  return {
    delete: vi.fn(),
    showErrorToast: vi.fn(),
    showGrayBackToast: vi.fn(),
    showFullScreenLoading: vi.fn(),
    hideFullScreenLoading: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      delete: mocks.delete,
    },
  };
});

vi.mock('@/hooks/useToastModal', () => {
  return {
    useToastModal: vi.fn(() => {
      return {
        showErrorToast: mocks.showErrorToast,
        showGrayBackToast: mocks.showGrayBackToast,
      };
    }),
  };
});

vi.mock('@/hooks/useFullScreenLoading', () => {
  return {
    useFullScreenLoading: vi.fn(() => {
      return {
        showFullScreenLoading: mocks.showFullScreenLoading,
        hideFullScreenLoading: mocks.hideFullScreenLoading,
      };
    }),
  };
});

describe('useDeleteComment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('削除成功時にコメントを削除し、ローディング解除・削除トースト・コメント再取得を実行する', async () => {
    vi.mocked(Axios.delete).mockResolvedValueOnce({ data: undefined });
    const queryClient = createQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteComment(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.deleteComment({ commentID: 1, matchID: 2 });
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.delete).toHaveBeenCalledTimes(1);
      expect(mocks.delete).toHaveBeenCalledWith(API_PATH.COMMENT, {
        data: {
          comment_id: 1,
        },
      });
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showGrayBackToast).toHaveBeenCalledTimes(1);
      expect(mocks.showGrayBackToast).toHaveBeenCalledWith(MESSAGE.COMMENT_DELETED);
      expect(invalidateQueries).toHaveBeenCalledTimes(1);
      expect(invalidateQueries).toHaveBeenCalledWith([QUERY_KEY.COMMENT, { id: 2 }]);
      expect(result.current.isSuccess).toBe(true);
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('セッション切れで削除に失敗した時はセッション切れトーストを表示しローディングを解除する', async () => {
    vi.mocked(Axios.delete).mockRejectedValueOnce({ status: 419 });

    const { result } = renderHook(() => useDeleteComment(), { wrapper: createWrapper() });

    act(() => {
      result.current.deleteComment({ commentID: 1, matchID: 2 });
    });

    await waitFor(() => {
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.SESSION_EXPIRED);
      expect(result.current.isSuccess).toBe(false);
      expect(mocks.showGrayBackToast).not.toHaveBeenCalled();
    });
  });

  test('想定外の削除失敗時は削除失敗トーストを表示しローディングを解除する', async () => {
    vi.mocked(Axios.delete).mockRejectedValueOnce(new Error('failed'));

    const { result } = renderHook(() => useDeleteComment(), { wrapper: createWrapper() });

    act(() => {
      result.current.deleteComment({ commentID: 1, matchID: 2 });
    });

    await waitFor(() => {
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.COMMENT_DELETE_FAILED);
      expect(result.current.isSuccess).toBe(false);
      expect(mocks.showGrayBackToast).not.toHaveBeenCalled();
    });
  });
});
