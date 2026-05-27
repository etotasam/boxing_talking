import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { CUSTOM_ERROR_CODE } from '@/constants/customErrorCodes';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { QUERY_KEY } from '@/constants/queryKeys';
import { useFetchUsersPrediction } from '../prediction';
import { useFullScreenLoading } from '../../useFullScreenLoading';
import { useLoginModal } from '../../useLoginModal';
import { useReactQuery } from '../../useReactQuery';
import { useToastModal } from '../../useToastModal';

type GuestLoginError = {
  data?: {
    errorCode?: number;
  };
};

export const useGuestLogin = () => {
  const { showErrorToast, showSuccessToast } = useToastModal();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  const { hideLoginModal } = useLoginModal();
  const { refetch: refetchMatchPrediction } = useFetchUsersPrediction();
  const { setReactQueryData } = useReactQuery();

  const api = useCallback(async (): Promise<void> => {
    await Axios.post<void>(API_PATH.GUEST_LOGIN).then((result) => result.data);
  }, []);

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });

  const guestLogin = () => {
    mutate(
      undefined,
      {
        onSuccess: () => {
          hideLoginModal();
          refetchMatchPrediction();
          hideFullScreenLoading();
          setReactQueryData<boolean>(QUERY_KEY.GUEST, true);
          showSuccessToast(MESSAGE.LOGIN_SUCCESS);
        },
        onError: (error: unknown) => {
          hideFullScreenLoading();
          if (
            (error as GuestLoginError).data?.errorCode ===
            CUSTOM_ERROR_CODE.UNABLE_TO_GENERATE_GUEST_TODAY
          ) {
            showErrorToast(MESSAGE.NOT_CREATE_GUEST_BY_LIMIT);
            return;
          }
          showErrorToast(MESSAGE.LOGIN_FAILED);
        },
      }
    );
  };

  return { guestLogin, isLoading, isSuccess };
};
