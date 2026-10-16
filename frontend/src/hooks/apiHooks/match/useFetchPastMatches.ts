import { useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import type { MatchDataType } from '@/types';

export const useFetchPastMatches = () => {
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  const fetcher = useCallback(async () => {
    showFullScreenLoading();
    try {
      const res = await Axios.get(API_PATH.MATCH, { params: { range: 'past' } }).then(
        (result) => result.data
      );
      return res.data;
    } finally {
      hideFullScreenLoading();
    }
  }, [showFullScreenLoading, hideFullScreenLoading]);

  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType[]>({
    queryKey: [QUERY_KEY.FETCH_PAST_MATCHES],
    queryFn: fetcher,
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    enabled: true,
  });

  return { data, isLoading, isError, isRefetching, refetch };
};
