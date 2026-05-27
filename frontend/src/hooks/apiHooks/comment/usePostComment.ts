import { useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useRecoilState } from 'recoil';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { HTTP_STATUS_CODE } from '@/constants/httpStatusCodes';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useToastModal } from '@/hooks/useToastModal';
import { apiFetchState } from '@/store/apiFetchDataState';
import type { PostCommentApiError, PostCommentParams } from './types';

export const usePostComment = () => {
  const { showErrorToast, showSuccessToast } = useToastModal();

  //? コメントの改行は5行までに書き換える
  const sanitizeComment = (commentText: string) => {
    commentText = commentText.trim();

    commentText = commentText.replace(/\n{4,}/g, '\n\n\n');

    return commentText;
  };

  const queryClient = useQueryClient();
  const api = useCallback(async ({ matchId, comment }: PostCommentParams) => {
    await Axios.post(API_PATH.COMMENT, {
      matchId,
      comment,
    });
  }, []);

  const {
    mutate,
    isLoading: isPostLoading,
    isSuccess: isPostSuccess,
    isError,
  } = useMutation<void, PostCommentApiError, PostCommentParams>(api, {
    onMutate: () => {},
  });
  const postComment = ({ matchId, comment }: PostCommentParams) => {
    const sanitizedComment = sanitizeComment(comment);
    mutate(
      { matchId, comment: sanitizedComment },
      {
        onSuccess: () => {
          showSuccessToast(MESSAGE.COMMENT_POST_SUCCESS);
          // ? match_idを指定してコメントを再取得
          queryClient.invalidateQueries([QUERY_KEY.COMMENT, { id: matchId }]);
          return;
        },
        onError: (error) => {
          if (error.status === 419) {
            showErrorToast(MESSAGE.SESSION_EXPIRED);
            return;
          }
          if (error.status === 401) {
            showErrorToast(MESSAGE.FAILED_POST_COMMENT_WITHOUT_AUTH);
            return;
          }
          //? 入力エラー
          if (error.status === HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY) {
            const errors = error.message?.errors;
            if (errors?.comment) {
              //? コメントが長すぎる(1000文字以内)
              if (errors.comment.includes('The comment must not be greater')) {
                showErrorToast(MESSAGE.COMMENT_IS_TOO_LONG);
                return;
              }
              //? 空のコメント
              if (errors.comment.includes('comment is require')) {
                showErrorToast(MESSAGE.COMMENT_IS_NOT_ENTER);
                return;
              }
            }
            //? 試合が存在しない
            if (errors?.matchId) {
              if (errors.matchId.includes('match_id is require')) {
                showErrorToast(MESSAGE.COMMENT_POST_FAILED);
                return;
              }
            }
          }
          //? コメント投稿失敗
          showErrorToast(MESSAGE.COMMENT_POST_FAILED);
          return;
        },
      }
    );
  };

  const [commentPostState, setCommentPostState] = useRecoilState(apiFetchState('comments/post'));
  useEffect(() => {
    if (isPostLoading) {
      setCommentPostState('loading');
    } else if (isPostSuccess) {
      setCommentPostState('success');
    } else if (isError) {
      setCommentPostState('error');
    } else {
      setCommentPostState('idle');
    }
  }, [isPostLoading, isPostSuccess, isError, setCommentPostState]);

  return { postComment, commentPostState };
};
