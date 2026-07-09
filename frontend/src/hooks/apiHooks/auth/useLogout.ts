import { useMutation, useQueryClient } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useFetchUsersPrediction } from '../prediction';
import { useFullScreenLoading } from '../../useFullScreenLoading';
import { useMenuModal } from '../../useMenuModal';
import { useToastModal } from '../../useToastModal';

export const useLogout = () => {
  const { refetch: refetchMatchPrediction } = useFetchUsersPrediction();
  const queryClient = useQueryClient();
  const { showErrorToast, showGrayBackToast } = useToastModal();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  const { hide: hideMenuModal } = useMenuModal();

  const api = async () => {
    await Axios.post<void>(API_PATH.USER_LOGOUT).then((result) => result.data);
  };

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });

  const logout = () => {
    mutate(
      undefined,
      {
        onSuccess: () => {
          queryClient.removeQueries(QUERY_KEY.PREDICTION);
          queryClient.removeQueries(QUERY_KEY.MATCH_PREDICTIONS);
          queryClient.setQueryData(QUERY_KEY.AUTH, null);
          queryClient.invalidateQueries(QUERY_KEY.ADMIN);
          refetchMatchPrediction();
          showGrayBackToast(MESSAGE.LOGOUT_SUCCESS);
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
  };

  return { logout, isLoading, isSuccess };
};
