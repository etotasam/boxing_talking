import { useCallback } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useToastModal } from '@/hooks/useToastModal';
import type { DeleteCommentParams } from './types';

export const useDeleteComment = () => {
  const { showErrorToast, showGrayBackToast } = useToastModal();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  const queryClient = useQueryClient();

  const api = useCallback(async ({ commentID }: DeleteCommentParams) => {
    await Axios.delete(API_PATH.COMMENT, {
      data: {
        comment_id: commentID,
      },
    });
  }, []);

  const {
    mutate,
    isPending: isLoading,
    isSuccess,
  } = useMutation({
    mutationFn: api,
    onMutate: () => {
      showFullScreenLoading();
    },
  });
  const deleteComment = ({ commentID, matchID }: DeleteCommentParams) => {
    mutate(
      { commentID, matchID },
      {
        onSuccess: () => {
          //? コメントの再取得。※refetch()を使うとmatchID=0での呼び出しが1回入るのでうざい
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY.COMMENT, { id: matchID }] });
          hideFullScreenLoading();
          showGrayBackToast(MESSAGE.COMMENT_DELETED);
          return;
        },
        onError: (error: unknown) => {
          hideFullScreenLoading();
          if ((error as AxiosError).status === 419) {
            showErrorToast(MESSAGE.SESSION_EXPIRED);
            return;
          }
          showErrorToast(MESSAGE.COMMENT_DELETE_FAILED);
          return;
        },
      }
    );
  };

  return { deleteComment, isLoading, isSuccess };
};
