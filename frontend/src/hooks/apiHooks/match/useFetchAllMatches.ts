import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import type { MatchDataType } from '@/types';

//! すべての試合情報の取得(過去含めすべて)
export const useFetchAllMatches = () => {
  const fetcher = useCallback(async () => {
    const res = await Axios.get<{ data: MatchDataType[] }>(API_PATH.MATCH, {
      params: { range: 'all' },
    }).then((result) => result.data);
    return res.data;
  }, []);

  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType[]>(
    QUERY_KEY.FETCH_ALL_MATCHES,
    fetcher,
    { keepPreviousData: true, staleTime: Infinity, enabled: true }
  );

  return { data, isLoading, isError, isRefetching, refetch };
};
