/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback } from "react"
import { QUERY_KEY } from "@/constants/queryKeys"
import { Axios } from "@/api/axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { MESSAGE } from "@/constants/statusesOnToastModal"
import { TOKEN_ERROR_MESSAGE } from "@/constants/tokenErrorMessage"
import { API_PATH } from "@/constants/apiPath"
import { CUSTOM_ERROR_CODE } from "@/constants/customErrorCodes"
import { HTTP_STATUS_CODE } from "@/constants/httpStatusCodes"
//! Recoil
import { useSetRecoilState } from "recoil"
import { tokenErrorMessageState } from "@/store/tokenErrorMessageState"
import { authCheckingState } from "@/store/authCheckingState"
// !hooks
import { useMenuModal } from "../useMenuModal"
import { useToastModal } from "../useToastModal"
import { useFullScreenLoading } from "../useFullScreenLoading"
import { useLoginModal } from "../useLoginModal"
import { useFetchUsersPrediction } from "./useWinLossPrediction"
import { useReactQuery } from "../useReactQuery"
//! types
import type { UserType } from "@/types"


//! ゲストauthチェック
export const useGuest = () => {

  const api = useCallback(async () => {
    try {
      const res = await Axios.get(API_PATH.GUEST).then(result => result.data);
      return Boolean(res);
    } catch (error) {
      return false
    }
  }, [])
  const { data, isLoading, isError } = useQuery<boolean>(QUERY_KEY.GUEST, api, {
    retry: false,
    staleTime: Infinity
  })

  return { data, isLoading, isError }
}

//! ゲストログイン
export const useGuestLogin = () => {
  // ? react query
  // const queryClient = useQueryClient()
  // ? toast modal
  const { showErrorToast, showSuccessToast } = useToastModal()
  // ? Loading state
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading()
  // ? login modal (hook)
  const { hideLoginModal } = useLoginModal()
  const { refetch: refetchMatchPrediction } = useFetchUsersPrediction()

  //? ReactQuery controller
  const { setReactQueryData } = useReactQuery()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const api = useCallback(async (_: unknown): Promise<void> => {
    await Axios.post<void>(API_PATH.GUEST_LOGIN).then(result => result.data)
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading()
    }
  })

  const guestLogin = () => {
    mutate({}, {
      onSuccess: () => {
        hideLoginModal()
        refetchMatchPrediction()
        hideFullScreenLoading()
        setReactQueryData<boolean>(QUERY_KEY.GUEST, true)
        showSuccessToast(MESSAGE.LOGIN_SUCCESS)
      },
      onError: (error: any) => {
        hideFullScreenLoading()
        if (error.data.errorCode === CUSTOM_ERROR_CODE.UNABLE_TO_GENERATE_GUEST_TODAY) {
          showErrorToast(MESSAGE.NOT_CREATE_GUEST_BY_LIMIT)
          return
        }
        showErrorToast(MESSAGE.LOGIN_FAILED)

      }
    })
  }
  return { guestLogin, isLoading, isSuccess }
}

//! ゲストログアウト
export const useGuestLogout = () => {
  const { refetch: refetchMatchPrediction } = useFetchUsersPrediction()
  const queryClient = useQueryClient()
  const { showErrorToast, showSuccessToast } = useToastModal()
  const { hide: hideMenuModal } = useMenuModal()
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading()
  // ? api
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const api = useCallback(async (_: unknown) => {
    await Axios.post<void>(API_PATH.GUEST_LOGOUT).then(result => result.data)
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading()
    }
  })
  const guestLogout = useCallback(() => {
    mutate({}, {
      onSuccess: () => {
        // ? ユーザー情報のキャッシュをclear
        refetchMatchPrediction()
        queryClient.setQueryData<boolean>(QUERY_KEY.GUEST, false)
        // successful()
        showSuccessToast(MESSAGE.LOGOUT_SUCCESS)
        hideMenuModal()
      },
      onError: () => {
        // hasError()
        showErrorToast(MESSAGE.LOGOUT_FAILED)
      },
      onSettled: () => {
        hideFullScreenLoading()
      }
    })
  }, [])
  return { guestLogout, isLoading, isSuccess }
}

//! auth check (user)
export const useAuth = () => {
  const queryClient = useQueryClient()

  const api = useCallback(async () => {
    const res = await Axios.get(API_PATH.USER).then(result => result.data)
    return res.data
  }, [])
  const { data, isLoading, isError } = useQuery<UserType | null>(QUERY_KEY.AUTH, api, {
    retry: false,
    staleTime: Infinity,
    onSuccess: (data) => {
      if (!data) {
        queryClient.setQueryData<UserType | null>(QUERY_KEY.AUTH, null)
      }
    },
    onError: () => {
    }
  })

  return { data, isLoading, isError }
}

//! ユーザ作成（仮登録）
export const usePreSignUp = () => {
  // ? react query
  // const queryClient = useQueryClient()
  // ? toast modal
  const { showErrorToast } = useToastModal()
  // ? Loading state (hook)
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading()

  type ApiPropsType = {
    name: string,
    email: string,
    password: string
  }
  const api = useCallback(async ({ name, email, password }: ApiPropsType) => {
    const res = await Axios.post<UserType>(API_PATH.USER_PRE_CREATE, { name, email, password }).then(result => result.data)
    return res
  }, [])
  const { mutate, isLoading, isSuccess, isError } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading()
    }
  })
  const preSignUp = ({ name, email, password }: ApiPropsType) => {
    mutate({ name, email, password }, {
      onSuccess: () => {
        hideFullScreenLoading()
      },

      onError: (error: any) => {
        hideFullScreenLoading()
        if (error.status === HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY) {
          const errorMessages = error.data.message as any
          if (errorMessages.email) {
            if (errorMessages.email.includes('email is already exists')) {
              showErrorToast(MESSAGE.EMAIL_HAS_ALREADY_EXIST)
              return
            }
          }
          if (errorMessages.name) {
            if ((errorMessages.name as string[]).includes('name is already used')) {
              showErrorToast(MESSAGE.USER_NAME_ALREADY_USE)
              return
            }
            if ((errorMessages.name as string[]).includes('The name must not be greater than 30 characters.')) {
              showErrorToast(MESSAGE.NAME_CHAR_LIMIT_OVER)
              return
            }
          }
          showErrorToast(MESSAGE.SIGNUP_LACK_INPUT)
          return
        }

        showErrorToast(MESSAGE.USER_REGISTER_FAILED)
      }
    })
  }
  return { preSignUp, isLoading, isSuccess, isError }
}

//! ユーザ登録（本登録）
export const useSignUpIdentification = () => {
  // ? react query
  const setAuthenticatingState = useSetRecoilState(authCheckingState)
  const setTokenErrorMessage = useSetRecoilState(tokenErrorMessageState)

  const api = useCallback(async ({ token }: { token: string }) => {
    try {
      const res = await Axios.post<boolean>(API_PATH.USER_CREATE, { token }).then(result => result.data)
      setAuthenticatingState({ isLoading: false, isError: false, isSuccess: true })
      return res
    } catch (error: any) {
      const errorCode = error.data.errorCode
      if (errorCode === CUSTOM_ERROR_CODE.EXPIRED_TOKEN) {
        setTokenErrorMessage(TOKEN_ERROR_MESSAGE.EXPIRED_TOKEN)
      }
      if (errorCode === CUSTOM_ERROR_CODE.INVALID_TOKEN) {
        setTokenErrorMessage(TOKEN_ERROR_MESSAGE.INVALID_TOKEN)
      }
      setAuthenticatingState({ isLoading: false, isError: true, isSuccess: false })
    }
  }, [])
  const { mutate } = useMutation(api, {
    onMutate: () => {
      setAuthenticatingState({ isLoading: true, isError: false, isSuccess: false })
    }
  })
  const createUser = ({ token }: { token: string }) => {
    mutate({ token }, {
      onSuccess: () => {
      },

      onError: () => {
      }
    })
  }
  return { createUser }
}

//! ログイン
export const useLogin = () => {
  const { refetch: refetchAdmin } = useAdmin()
  // ? react query
  // ? toast modal
  const { showSuccessToast, showErrorToast } = useToastModal()
  // ? Loading state
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading()
  // ? login modal (hook)
  const { hideLoginModal } = useLoginModal()
  const { refetch: refetchMatchPrediction } = useFetchUsersPrediction()
  //? ReactQuery controller
  const { setReactQueryData } = useReactQuery()

  const api = useCallback(async (props: { email: string, password: string }) => {
    const res = await Axios.post<{ data: UserType }>(API_PATH.USER_LOGIN, { ...props }).then(result => result.data)
    return res.data
  }, [])
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading()
    }
  })
  const login = (props: { email: string, password: string }) => {
    mutate({ ...props }, {
      // ! ログイン成功時
      onSuccess: (userData) => {
        refetchMatchPrediction()
        hideLoginModal()
        hideFullScreenLoading()
        refetchAdmin()
        // ? ログインユーザーをreact query内でキャッシュする
        setReactQueryData<UserType | boolean>(QUERY_KEY.AUTH, userData)
        showSuccessToast(MESSAGE.LOGIN_SUCCESS)

      },
      // ! ログイン失敗時
      onError: () => {
        hideFullScreenLoading()
        showErrorToast(MESSAGE.LOGIN_FAILED)
      }
    })
  }
  return { login, isLoading, isSuccess }
}

//! ログアウト
export const useLogout = () => {
  const { refetch: refetchMatchPrediction } = useFetchUsersPrediction()
  const queryClient = useQueryClient()
  const { showErrorToast, showGrayBackToast } = useToastModal()
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading()
  const { hide: hideMenuModal } = useMenuModal()
  // ? api
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const api = async (_: any) => {
    await Axios.post<void>(API_PATH.USER_LOGOUT).then(result => result.data)
  }


  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading()
    }
  })
  const logout = () => {
    mutate({}, {
      onSuccess: () => {
        // ? ユーザー情報のキャッシュをclear
        queryClient.setQueryData(QUERY_KEY.AUTH, null)
        queryClient.invalidateQueries(QUERY_KEY.ADMIN)
        refetchMatchPrediction()
        showGrayBackToast(MESSAGE.LOGOUT_SUCCESS)
        hideMenuModal()
      },
      onError: () => {
        showErrorToast(MESSAGE.LOGOUT_FAILED)
      },
      onSettled: () => {
        hideFullScreenLoading()
      }
    })
  }
  return { logout, isLoading, isSuccess }
}

// ! 管理者判定
export const useAdmin = () => {
  const api = useCallback(async () => {
    try {
      const res = await Axios.get(API_PATH.ADMIN).then(result => result.data)
      return res
    } catch (error) {
      return null
    }
  }, [])
  const { data: isAdmin, isLoading, isError, refetch } = useQuery<boolean>(QUERY_KEY.ADMIN, api, {
    retry: false,
    staleTime: Infinity
  })

  return { isAdmin, isLoading, isError, refetch }
}
