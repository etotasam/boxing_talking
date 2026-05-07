import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';

//! 管理者判定
export const useAdmin = () => {
  const api = useCallback(async () => {
    const res = await Axios.get(API_PATH.ADMIN).then((result) => result.data);
    return res;
  }, []);

  const { data: isAdmin, isLoading, isError, refetch } = useQuery<boolean>(QUERY_KEY.ADMIN, api, {
    retry: false,
    staleTime: Infinity,
  });

  return { isAdmin, isLoading, isError, refetch };
};
