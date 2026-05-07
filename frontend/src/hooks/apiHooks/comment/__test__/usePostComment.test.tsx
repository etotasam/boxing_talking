import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { HTTP_STATUS_CODE } from '@/constants/httpStatusCodes';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { usePostComment } from '@/hooks/apiHooks/comment';
import { createQueryClient, createWrapper } from './testUtils';

const mocks = vi.hoisted(() => {
  return {
    post: vi.fn(),
    showErrorToast: vi.fn(),
    showSuccessToast: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      post: mocks.post,
    },
  };
});

vi.mock('@/hooks/useToastModal', () => {
  return {
    useToastModal: vi.fn(() => {
      return {
        showErrorToast: mocks.showErrorToast,
        showSuccessToast: mocks.showSuccessToast,
      };
    }),
  };
});

describe('usePostComment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('投稿成功時にコメントを送信し、成功トーストとコメント再取得を実行する', async () => {
    vi.mocked(Axios.post).mockResolvedValueOnce({ data: undefined });
    const queryClient = createQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => usePostComment(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.postComment({ matchId: 1, comment: 'test comment' });
    });

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledWith(API_PATH.COMMENT, {
        matchId: 1,
        comment: 'test comment',
      });
      expect(mocks.showSuccessToast).toHaveBeenCalledTimes(1);
      expect(mocks.showSuccessToast).toHaveBeenCalledWith(MESSAGE.COMMENT_POST_SUCCESS);
      expect(invalidateQueries).toHaveBeenCalledTimes(1);
      expect(invalidateQueries).toHaveBeenCalledWith([QUERY_KEY.COMMENT, { id: 1 }]);
      expect(result.current.commentPostState).toBe('success');
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('投稿前に前後の空白を削除し、4連続以上の改行を3連続に整形する', async () => {
    vi.mocked(Axios.post).mockResolvedValueOnce({ data: undefined });

    const { result } = renderHook(() => usePostComment(), { wrapper: createWrapper() });

    act(() => {
      result.current.postComment({ matchId: 1, comment: '  line1\n\n\n\nline2  ' });
    });

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith(API_PATH.COMMENT, {
        matchId: 1,
        comment: 'line1\n\n\nline2',
      });
    });
  });

  test('セッション切れで投稿に失敗した時はセッション切れトーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({ status: 419 });

    const { result } = renderHook(() => usePostComment(), { wrapper: createWrapper() });

    act(() => {
      result.current.postComment({ matchId: 1, comment: 'test comment' });
    });

    await waitFor(() => {
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.SESSION_EXPIRED);
      expect(result.current.commentPostState).toBe('error');
    });
  });

  test('未認証で投稿に失敗した時はログイン要求トーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({ status: 401 });

    const { result } = renderHook(() => usePostComment(), { wrapper: createWrapper() });

    act(() => {
      result.current.postComment({ matchId: 1, comment: 'test comment' });
    });

    await waitFor(() => {
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.FAILED_POST_COMMENT_WITHOUT_AUTH);
    });
  });

  test('コメント文字数超過の入力エラー時は文字数超過トーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({
      status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
      message: {
        errors: {
          comment: ['The comment must not be greater'],
        },
      },
    });

    const { result } = renderHook(() => usePostComment(), { wrapper: createWrapper() });

    act(() => {
      result.current.postComment({ matchId: 1, comment: 'test comment' });
    });

    await waitFor(() => {
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.COMMENT_IS_TOO_LONG);
    });
  });

  test('空コメントの入力エラー時は未入力トーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({
      status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
      message: {
        errors: {
          comment: ['comment is require'],
        },
      },
    });

    const { result } = renderHook(() => usePostComment(), { wrapper: createWrapper() });

    act(() => {
      result.current.postComment({ matchId: 1, comment: '' });
    });

    await waitFor(() => {
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.COMMENT_IS_NOT_ENTER);
    });
  });

  test('試合 ID の入力エラー時は投稿失敗トーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({
      status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
      message: {
        errors: {
          matchId: ['match_id is require'],
        },
      },
    });

    const { result } = renderHook(() => usePostComment(), { wrapper: createWrapper() });

    act(() => {
      result.current.postComment({ matchId: 0, comment: 'test comment' });
    });

    await waitFor(() => {
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.COMMENT_POST_FAILED);
    });
  });

  test('想定外の投稿失敗時は投稿失敗トーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce(new Error('failed'));

    const { result } = renderHook(() => usePostComment(), { wrapper: createWrapper() });

    act(() => {
      result.current.postComment({ matchId: 1, comment: 'test comment' });
    });

    await waitFor(() => {
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.COMMENT_POST_FAILED);
    });
  });
});
