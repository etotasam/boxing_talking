import { useEffect } from 'react';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useToastModal } from '@/hooks/useToastModal';
import { apiFetchState } from '@/store/apiFetchDataState';
import type { CommentType } from '@/types';

//! コメント取得(旧)
export const useFetchCommentsOld = (matchId: number) => {
  const { showErrorToast } = useToastModal();

  const api = async () => {
    const res = await Axios.get(API_PATH.COMMENT_OLD, {
      params: {
        matchId,
      },
    }).then((v) => v.data);
    return res.data;
  };

  const {
    data,
    isLoading: isCommentsLoading,
    isFetching,
    refetch,
    isError,
    isSuccess,
  } = useQuery<CommentType[]>([QUERY_KEY.COMMENT_OLD, { id: matchId }], api, {
    staleTime: 5 * 60 * 1000,
    onError: (error: unknown) => {
      if ((error as AxiosError).status === 419) {
        showErrorToast(MESSAGE.SESSION_EXPIRED);
        return;
      }
    },
  });

  const [commentFetchState, setCommentFetchState] = useRecoilState(apiFetchState('comments/fetch'));

  useEffect(() => {
    if (isCommentsLoading) {
      setCommentFetchState('loading');
    } else if (isFetching) {
      setCommentFetchState('refetching');
    } else if (isSuccess) {
      setCommentFetchState('success');
    } else if (isError) {
      setCommentFetchState('error');
    } else {
      setCommentFetchState('idle');
    }
  }, [isCommentsLoading, isFetching, isSuccess, isError, setCommentFetchState]);

  return { data, refetch, commentFetchState };
};
