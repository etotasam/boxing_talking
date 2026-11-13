import { useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import type { MatchDataType } from '@/types';

export const useFetchMatchById = (matchId: number) => {
  const api = useCallback(async () => {
    const res = await Axios.get(`${API_PATH.MATCH}/${matchId}/show`).then((result) => result.data);
    return res.data;
  }, [matchId]);

  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType>({
    queryKey: [QUERY_KEY.MATCH_SINGLE, { id: matchId }],
    queryFn: api,
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    enabled: true,
  });

  return { data, isLoading, isError, isRefetching, refetch };
};
