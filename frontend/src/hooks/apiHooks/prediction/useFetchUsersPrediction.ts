import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useAuth } from '../auth/useAuth';
import { useGuest } from '../auth/useGuest';
import type { PredictionType } from '@/types';

export const useFetchUsersPrediction = () => {
  const { data: authUser } = useAuth();
  const { data: isGuest } = useGuest();
  const isAuthOrGuest = Boolean(authUser || isGuest);

  const api = useCallback(async () => {
    const res = await Axios.get<{ data: PredictionType[] | null }>(API_PATH.PREDICTION).then(
      (v) => v.data
    );
    return res.data;
  }, []);
  const {
    data,
    isLoading: isUserPredictionLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEY.PREDICTION],
    queryFn: api,
    staleTime: Infinity,
    enabled: isAuthOrGuest,
  });

  const usePredictionFetchState = isUserPredictionLoading
    ? 'loading'
    : isRefetching
    ? 'refetching'
    : 'idle';

  // TanStack Query の成功データには null を保持し、既存の公開値は維持する。
  return { data: data ?? undefined, refetch, usePredictionFetchState };
};
