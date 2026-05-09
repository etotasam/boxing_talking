import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useFetchUsersPrediction } from '../prediction';
import { useFullScreenLoading } from '../../useFullScreenLoading';
import { useMenuModal } from '../../useMenuModal';
import { useToastModal } from '../../useToastModal';

//! ゲストログアウト
export const useGuestLogout = () => {
  const { refetch: refetchMatchPrediction } = useFetchUsersPrediction();
  const queryClient = useQueryClient();
  const { showErrorToast, showSuccessToast } = useToastModal();
  const { hide: hideMenuModal } = useMenuModal();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();

  const api = useCallback(async (_: unknown) => {
    await Axios.post<void>(API_PATH.GUEST_LOGOUT).then((result) => result.data);
  }, []);

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });

  const guestLogout = useCallback(() => {
    mutate(
      {},
      {
        onSuccess: () => {
          refetchMatchPrediction();
          queryClient.setQueryData<boolean>(QUERY_KEY.GUEST, false);
          showSuccessToast(MESSAGE.LOGOUT_SUCCESS);
          hideMenuModal();
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
    hideMenuModal,
    mutate,
    queryClient,
    refetchMatchPrediction,
    showErrorToast,
    showSuccessToast,
  ]);

  return { guestLogout, isLoading, isSuccess };
};
