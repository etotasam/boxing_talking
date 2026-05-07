import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { CUSTOM_ERROR_CODE } from '@/constants/customErrorCodes';
import { HTTP_STATUS_CODE } from '@/constants/httpStatusCodes';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useReactQuery } from '@/hooks/useReactQuery';
import { useToastModal } from '@/hooks/useToastModal';
import type { BoxerApiErrorResponseType, RegisterBoxerDataType } from './types';

// //! boxer登録
export const useRegisterBoxer = () => {
  const { refetchReactQueryData } = useReactQuery();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  const { showSuccessToast, showErrorToast } = useToastModal();
  const api = useCallback(async (newBoxerData: RegisterBoxerDataType): Promise<void> => {
    await Axios.post<void>(API_PATH.BOXER, newBoxerData).then((v) => v.data);
    // return res
  }, []);
  const { mutate, isLoading, isError, isSuccess } = useMutation<
    void,
    BoxerApiErrorResponseType,
    RegisterBoxerDataType
  >(api, {
    onMutate: async () => {
      showFullScreenLoading();
    },
  });
  const registerBoxer = (newBoxerData: RegisterBoxerDataType) => {
    // const convertedBoxerDataBoxerData = convertToBoxerData(newBoxerData)
    mutate(newBoxerData, {
      onSuccess: () => {
        hideFullScreenLoading();
        showSuccessToast(MESSAGE.FIGHTER_REGISTER_SUCCESS);
        refetchReactQueryData(QUERY_KEY.BOXER);
      },
      onError: (error) => {
        hideFullScreenLoading();
        if (error.status === HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY) {
          if (error.data.errorCode === CUSTOM_ERROR_CODE.BOXER_ALREADY_EXISTS) {
            showErrorToast(MESSAGE.BOXER_IS_ALREADY_EXISTS);
            return;
          }
        }
        showErrorToast(MESSAGE.FIGHTER_REGISTER_FAILED);
      },
    });
  };
  return { registerBoxer, isLoading, isError, isSuccess };
};
