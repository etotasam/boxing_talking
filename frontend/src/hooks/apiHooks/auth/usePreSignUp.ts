import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { HTTP_STATUS_CODE } from '@/constants/httpStatusCodes';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useFullScreenLoading } from '../../useFullScreenLoading';
import { useToastModal } from '../../useToastModal';
import type { UserType } from '@/types';

type PreSignUpInput = {
  name: string;
  email: string;
  password: string;
};

type PreSignUpError = {
  status?: number;
  data?: {
    message?: {
      email?: string[];
      name?: string[];
    };
  };
};

export const usePreSignUp = () => {
  const { showErrorToast } = useToastModal();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();

  const api = useCallback(async ({ name, email, password }: PreSignUpInput) => {
    const res = await Axios.post<UserType>(API_PATH.USER_PRE_CREATE, {
      name,
      email,
      password,
    }).then((result) => result.data);
    return res;
  }, []);

  const { mutate, isLoading, isSuccess, isError } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });

  const preSignUp = ({ name, email, password }: PreSignUpInput) => {
    mutate(
      { name, email, password },
      {
        onSuccess: () => {
          hideFullScreenLoading();
        },
        onError: (error: unknown) => {
          hideFullScreenLoading();
          const formattedError = error as PreSignUpError;

          if (formattedError.status === HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY) {
            const errorMessages = formattedError.data?.message;

            if (errorMessages?.email?.includes('email is already exists')) {
              showErrorToast(MESSAGE.EMAIL_HAS_ALREADY_EXIST);
              return;
            }

            if (errorMessages?.name?.includes('name is already used')) {
              showErrorToast(MESSAGE.USER_NAME_ALREADY_USE);
              return;
            }

            if (
              errorMessages?.name?.includes(
                'The name must not be greater than 30 characters.'
              )
            ) {
              showErrorToast(MESSAGE.NAME_CHAR_LIMIT_OVER);
              return;
            }

            showErrorToast(MESSAGE.SIGNUP_LACK_INPUT);
            return;
          }

          showErrorToast(MESSAGE.USER_REGISTER_FAILED);
        },
      }
    );
  };

  return { preSignUp, isLoading, isSuccess, isError };
};
