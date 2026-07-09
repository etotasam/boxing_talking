import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useFetchUsersPrediction } from '../prediction';
import { useAdmin } from './useAdmin';
import { useFullScreenLoading } from '../../useFullScreenLoading';
import { useLoginModal } from '../../useLoginModal';
import { useReactQuery } from '../../useReactQuery';
import { useToastModal } from '../../useToastModal';
import type { UserType } from '@/types';

type LoginInput = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { refetch: refetchAdmin } = useAdmin();
  const { showSuccessToast, showErrorToast } = useToastModal();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  const { hideLoginModal } = useLoginModal();
  const { refetch: refetchMatchPrediction } = useFetchUsersPrediction();
  const { setReactQueryData } = useReactQuery();

  const api = useCallback(async (props: LoginInput) => {
    const res = await Axios.post<{ data: UserType }>(API_PATH.USER_LOGIN, {
      ...props,
    }).then((result) => result.data);
    return res.data;
  }, []);

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });

  const login = (props: LoginInput) => {
    mutate(
      { ...props },
      {
        onSuccess: (userData) => {
          queryClient.removeQueries(QUERY_KEY.PREDICTION);
          queryClient.removeQueries(QUERY_KEY.MATCH_PREDICTIONS);
          refetchMatchPrediction();
          hideLoginModal();
          hideFullScreenLoading();
          refetchAdmin();
          setReactQueryData<UserType | boolean>(QUERY_KEY.AUTH, userData);
          showSuccessToast(MESSAGE.LOGIN_SUCCESS);
        },
        onError: () => {
          hideFullScreenLoading();
          showErrorToast(MESSAGE.LOGIN_FAILED);
        },
      }
    );
  };

  return { login, isLoading, isSuccess };
};
