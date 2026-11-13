import { useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import type { MatchDataType } from '@/types';

export const useFetchAllMatches = () => {
  const fetcher = useCallback(async () => {
    const res = await Axios.get<{ data: MatchDataType[] }>(API_PATH.MATCH, {
      params: { range: 'all' },
    }).then((result) => result.data);
    return res.data;
  }, []);

  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType[]>({
    queryKey: [QUERY_KEY.FETCH_ALL_MATCHES],
    queryFn: fetcher,
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    enabled: true,
  });

  return { data, isLoading, isError, isRefetching, refetch };
};
