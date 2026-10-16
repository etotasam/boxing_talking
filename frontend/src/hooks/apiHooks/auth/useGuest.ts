import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';

export const useGuest = () => {
  const api = useCallback(async () => {
    try {
      const res = await Axios.get(API_PATH.GUEST).then((result) => result.data);
      return Boolean(res);
    } catch (error) {
      return false;
    }
  }, []);

  const { data, isLoading, isError } = useQuery<boolean>({
    queryKey: [QUERY_KEY.GUEST],
    queryFn: api,
    retry: false,
    staleTime: Infinity,
  });

  return { data, isLoading, isError };
};
