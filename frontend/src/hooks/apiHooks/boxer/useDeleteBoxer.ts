import { useMutation } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { CUSTOM_ERROR_CODE } from '@/constants/customErrorCodes';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useToastModal } from '@/hooks/useToastModal';
import type { BoxerType } from '@/types';
import { useFetchBoxers } from './useFetchBoxers';
import type { BoxerApiErrorResponseType } from './types';

// //! boxerデータ削除
export const useDeleteBoxer = () => {
  const { refetch: RefetchBoxerData } = useFetchBoxers();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  const { showErrorToast, showSuccessToast } = useToastModal();

  //? api
  const api = async (boxerData: BoxerType): Promise<void> => {
    await Axios.delete<void>(API_PATH.BOXER, {
      data: { boxerId: boxerData.id, engName: boxerData.engName },
    }).then((v) => v.data);
  };

  const { mutate, isLoading, isError, isSuccess } = useMutation<
    void,
    BoxerApiErrorResponseType,
    BoxerType
  >(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });
  const deleteBoxer = (boxerData: BoxerType) => {
    mutate(boxerData, {
      onSuccess: async () => {
        hideFullScreenLoading();
        showSuccessToast(MESSAGE.BOXER_DELETED);
        //? 選手データと選手数をリフェッチ
        RefetchBoxerData();
      },
      onError: (error) => {
        hideFullScreenLoading();
        const errorCode = error.data.errorCode;
        if (errorCode === CUSTOM_ERROR_CODE.BOXER_ALREADY_HAS_MATCH) {
          showErrorToast(MESSAGE.BOXER_IS_ALREADY_SETUP_MATCH);
          return;
        }
        if (errorCode === CUSTOM_ERROR_CODE.BOXER_NOT_FOUND) {
          showErrorToast(MESSAGE.ILLEGAL_DATA);
          return;
        }
        if (errorCode === CUSTOM_ERROR_CODE.BOXER_DELETE_FAILED) {
          showErrorToast(MESSAGE.FAILED_DELETE_BOXER);
          return;
        }
        showErrorToast(MESSAGE.FIGHTER_EDIT_FAILED);
        return;
      },
    });
  };

  return { deleteBoxer, isLoading, isError, isSuccess };
};
