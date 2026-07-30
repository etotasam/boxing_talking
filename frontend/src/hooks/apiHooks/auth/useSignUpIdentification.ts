import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { useSetRecoilState } from 'recoil';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { CUSTOM_ERROR_CODE } from '@/constants/customErrorCodes';
import { TOKEN_ERROR_MESSAGE } from '@/constants/tokenErrorMessage';
import { authCheckingState } from '@/store/authCheckingState';
import { tokenErrorMessageState } from '@/store/tokenErrorMessageState';

type SignUpIdentificationError = {
  data?: {
    errorCode?: number;
  };
};

export const useSignUpIdentification = () => {
  const setAuthenticatingState = useSetRecoilState(authCheckingState);
  const setTokenErrorMessage = useSetRecoilState(tokenErrorMessageState);

  const api = useCallback(async ({ token }: { token: string }) => {
    try {
      const res = await Axios.post<boolean>(API_PATH.USER_CREATE, { token }).then(
        (result) => result.data
      );
      setAuthenticatingState({ isLoading: false, isError: false, isSuccess: true });
      return res;
    } catch (error) {
      const errorCode = (error as SignUpIdentificationError).data?.errorCode;

      if (errorCode === CUSTOM_ERROR_CODE.EXPIRED_TOKEN) {
        setTokenErrorMessage(TOKEN_ERROR_MESSAGE.EXPIRED_TOKEN);
      }

      if (errorCode === CUSTOM_ERROR_CODE.INVALID_TOKEN) {
        setTokenErrorMessage(TOKEN_ERROR_MESSAGE.INVALID_TOKEN);
      }

      setAuthenticatingState({ isLoading: false, isError: true, isSuccess: false });
    }
  }, [setAuthenticatingState, setTokenErrorMessage]);

  const { mutate } = useMutation(api, {
    onMutate: () => {
      setAuthenticatingState({ isLoading: true, isError: false, isSuccess: false });
    },
  });

  const createUser = ({ token }: { token: string }) => {
    mutate(
      { token },
      {
        onSuccess: () => {},
        onError: () => {},
      }
    );
  };

  return { createUser };
};
