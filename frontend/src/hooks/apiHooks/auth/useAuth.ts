import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import type { UserType } from '@/types';

export const useAuth = () => {
  const api = useCallback(async () => {
    const res = await Axios.get<{ data?: UserType | null }>(API_PATH.USER).then(
      (result) => result.data
    );
    // 未認証時の空レスポンスも、従来の onSuccess と同様に null として保持する。
    return res?.data ?? null;
  }, []);

  const { data, isLoading, isError } = useQuery<UserType | null>({
    queryKey: [QUERY_KEY.AUTH],
    queryFn: api,
    retry: false,
    staleTime: Infinity,
  });

  return { data, isLoading, isError };
};
