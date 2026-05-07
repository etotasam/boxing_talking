import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import type { MatchDataType } from '@/types';

//! 過去の試合情報一覧の取得(試合後2週間以上経っている試合全部)
export const useFetchPastMatches = () => {
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  const fetcher = useCallback(async () => {
    showFullScreenLoading();
    const res = await Axios.get(API_PATH.MATCH, { params: { range: 'past' } }).then(
      (result) => result.data
    );
    return res.data;
  }, [showFullScreenLoading]);

  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType[]>(
    QUERY_KEY.FETCH_PAST_MATCHES,
    fetcher,
    {
      keepPreviousData: true,
      staleTime: Infinity,
      enabled: true,
      onSettled: () => {
        hideFullScreenLoading();
      },
    }
  );

  return { data, isLoading, isError, isRefetching, refetch };
};
