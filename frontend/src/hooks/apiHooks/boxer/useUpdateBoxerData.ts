import { useMutation } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { CUSTOM_ERROR_CODE } from '@/constants/customErrorCodes';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useReactQuery } from '@/hooks/useReactQuery';
import { useToastModal } from '@/hooks/useToastModal';
import type { BoxerApiErrorResponseType, UpdateBoxerDataType } from './types';

// //! boxerデータ更新
export const useUpdateBoxerData = () => {
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  const { refetchReactQueryArrayKeys } = useReactQuery();
  //? params page の取得
  const { showErrorToast, showSuccessToast } = useToastModal();
  const api = async (updateFighterData: UpdateBoxerDataType): Promise<void> => {
    await Axios.patch<void>(API_PATH.BOXER, updateFighterData);
  };
  const { mutate, isLoading, isSuccess } = useMutation<
    void,
    BoxerApiErrorResponseType,
    UpdateBoxerDataType
  >(api, {
    onMutate: async () => {
      showFullScreenLoading();
    },
    onSuccess: () => {
      hideFullScreenLoading();
      refetchReactQueryArrayKeys([QUERY_KEY.FETCH_MATCHES, QUERY_KEY.BOXER]);
      showSuccessToast(MESSAGE.FIGHTER_EDIT_SUCCESS);
    },
    onError: (error) => {
      hideFullScreenLoading();
      if (error.data.errorCode === CUSTOM_ERROR_CODE.TITLE_ALREADY_HAS_OTHER_BOXER) {
        showErrorToast(MESSAGE.FIGHTER_EDIT_FAILED);
        return;
      }
      showErrorToast(MESSAGE.FIGHTER_EDIT_FAILED);
    },
  });

  const updateBoxer = (updateFighterData: UpdateBoxerDataType) => {
    mutate(updateFighterData);
  };
  return { updateBoxer, isLoading, isSuccess };
};
