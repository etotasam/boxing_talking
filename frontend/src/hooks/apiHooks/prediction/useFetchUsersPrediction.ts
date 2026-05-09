import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useAuth } from '../auth/useAuth';
import { useGuest } from '../auth/useGuest';
import type { PredictionType } from '@/types';

//! ユーザーの勝敗予想の取得
export const useFetchUsersPrediction = () => {
  const { data: authUser } = useAuth();
  const { data: isGuest } = useGuest();
  const isAuthOrGuest = Boolean(authUser || isGuest);

  const api = useCallback(async () => {
    const res = await Axios.get<{ data: PredictionType[] | null }>(API_PATH.PREDICTION).then((v) => v.data);
    const formattedData = res.data === null ? undefined : res.data;
    return formattedData;
  }, []);
  const { data, isLoading: isUserPredictionLoading, isRefetching, refetch } = useQuery(
    QUERY_KEY.PREDICTION,
    api,
    {
      staleTime: Infinity,
      enabled: isAuthOrGuest,
      onError: () => {},
      onSuccess: () => {},
    }
  );

  const usePredictionFetchState = isUserPredictionLoading
    ? 'loading'
    : isRefetching
      ? 'refetching'
      : 'idle';

  return { data, refetch, usePredictionFetchState };
};
