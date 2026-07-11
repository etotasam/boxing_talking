import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useFetchUsersPrediction } from '../prediction';
import { useFullScreenLoading } from '../../useFullScreenLoading';
import { useToastModal } from '../../useToastModal';

export const useGuestLogout = () => {
  const { refetch: refetchMatchPrediction } = useFetchUsersPrediction();
  const queryClient = useQueryClient();
  const { showErrorToast, showSuccessToast } = useToastModal();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();

  const api = useCallback(async () => {
    await Axios.post<void>(API_PATH.GUEST_LOGOUT).then((result) => result.data);
  }, []);

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });

  const guestLogout = useCallback(() => {
    mutate(
      undefined,
      {
        onSuccess: () => {
          queryClient.removeQueries(QUERY_KEY.PREDICTION);
          queryClient.removeQueries(QUERY_KEY.MATCH_PREDICTIONS);
          refetchMatchPrediction();
          queryClient.setQueryData<boolean>(QUERY_KEY.GUEST, false);
          showSuccessToast(MESSAGE.LOGOUT_SUCCESS);
        },
        onError: () => {
          showErrorToast(MESSAGE.LOGOUT_FAILED);
        },
        onSettled: () => {
          hideFullScreenLoading();
        },
      }
    );
  }, [
    hideFullScreenLoading,
    mutate,
    queryClient,
    refetchMatchPrediction,
    showErrorToast,
    showSuccessToast,
  ]);

  return { guestLogout, isLoading, isSuccess };
};
