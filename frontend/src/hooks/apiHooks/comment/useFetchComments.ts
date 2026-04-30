import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { apiFetchState } from '@/store/apiFetchDataState';
import type { CommentType } from '@/types';
import { FETCH_COMMENTS_LIMIT_COUNT } from './constants';
import type { FetchCommentsParams } from './types';

//! コメント取得(limitで取得数、createdAtより以前)
export const useFetchComments = ({ matchId, createdAt, page }: FetchCommentsParams) => {
  const api = async () => {
    const res = await Axios.get(API_PATH.COMMENT, {
      params: {
        matchId,
        createdAt,
        page,
        limit: FETCH_COMMENTS_LIMIT_COUNT,
      },
    }).then((v) => v.data);
    return res.data;
  };

  const { data, refetch, isRefetching, isError } = useQuery<CommentType[]>(
    [QUERY_KEY.COMMENT, { matchId }],
    api,
    {
      cacheTime: 0,
      enabled: false,
      keepPreviousData: false,
    }
  );

  const [commentFetchState, setCommentFetchState] = useRecoilState(apiFetchState('comments/fetch'));
  useEffect(() => {
    if (isRefetching) {
      setCommentFetchState('refetching');
    } else if (isError) {
      setCommentFetchState('error');
    } else {
      setCommentFetchState('idle');
    }
  }, [isRefetching, isError, setCommentFetchState]);

  return { data, refetch, commentFetchState };
};
