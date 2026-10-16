import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import type { UserType } from '@/types';

export const useAuth = () => {
  const api = useCallback(async () => {
    const res = await Axios.get(API_PATH.USER).then((result) => result.data);
    return res.data;
  }, []);

  const { data, isLoading, isError } = useQuery<UserType | null>({
    queryKey: [QUERY_KEY.AUTH],
    queryFn: api,
    retry: false,
    staleTime: Infinity,
  });

  return { data, isLoading, isError };
};
