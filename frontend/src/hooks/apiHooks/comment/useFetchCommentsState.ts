import { useQuery } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { FETCH_COMMENTS_LIMIT_COUNT } from './constants';
import type { FetchCommentsStateResponse } from './types';

//! コメントのmax page
export const useFetchCommentsState = (matchId: number) => {
  const api = async () => {
    const res = await Axios.get<FetchCommentsStateResponse>(API_PATH.COMMENT_STATE, {
      params: { matchId, limit: FETCH_COMMENTS_LIMIT_COUNT },
    }).then((v) => v.data);
    return res;
  };

  const { data, isError } = useQuery([QUERY_KEY.COMMENT_STATE, { matchId }], api, {
    keepPreviousData: true,
    enabled: true,
    staleTime: Infinity,
  });

  return { data, isError };
};
