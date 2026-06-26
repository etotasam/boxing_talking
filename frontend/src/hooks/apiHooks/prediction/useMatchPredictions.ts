import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import type { MatchPredictionsType } from '@/types';

export const useMatchPredictions = (
  matchId: number,
  userPrediction?: 'red' | 'blue' | false
) => {
  const api = useCallback(async () => {
    const res = await Axios.get<{ data: MatchPredictionsType }>(API_PATH.MATCH_PREDICTION, {
      params: { match_id: matchId },
    }).then((v) => v.data);
    return res.data;
  }, [matchId]);

  const { data, isLoading, isRefetching, refetch } = useQuery(
    [QUERY_KEY.MATCH_PREDICTIONS, { id: matchId, userPrediction }],
    api,
    {
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    }
  );
  const matchPredictionFetchState = isLoading ? 'loading' : isRefetching ? 'refetching' : 'idle';

  return { data, matchPredictionFetchState, refetch };
};
