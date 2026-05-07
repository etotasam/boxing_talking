import { useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import type { UserType } from '@/types';

//! auth check (user)
export const useAuth = () => {
  const queryClient = useQueryClient();

  const api = useCallback(async () => {
    const res = await Axios.get(API_PATH.USER).then((result) => result.data);
    return res.data;
  }, []);

  const { data, isLoading, isError } = useQuery<UserType | null>(QUERY_KEY.AUTH, api, {
    retry: false,
    staleTime: Infinity,
    onSuccess: (data) => {
      if (!data) {
        queryClient.setQueryData<UserType | null>(QUERY_KEY.AUTH, null);
      }
    },
    onError: () => {},
  });

  return { data, isLoading, isError };
};
