/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback } from "react"
import { QUERY_KEY } from "@/assets/queryKeys"
import { Axios } from "@/assets/axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { MESSAGE, BG_COLOR_ON_TOAST_MODAL } from "@/assets/statusesOnToastModal"
import { TOKEN_ERROR_MESSAGE } from "@/assets/tokenErrorMessage"
import { API_PATH } from "@/assets/apiPath"
import { CUSTOM_ERROR_CODE } from "@/assets/customErrorCodes"
//! Recoil
import { useSetRecoilState } from "recoil"
import { tokenErrorMessageState } from "@/store/tokenErrorMessageState"
import { authCheckingState } from "@/store/authCheckingState"
// !hooks
import { useToastModal } from "../useToastModal"
import { useLoading } from "../useLoading"
import { useLoginModal } from "../useLoginModal"
import { useFetchUsersPrediction } from "./uesWinLossPrediction"
import { useReactQuery } from "../useReactQuery"
//! types
import type { UserType } from "@/assets/types"


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
  const { showToastModalMessage } = useToastModal()
  // ? Loading state
  const { resetLoadingState, startLoading } = useLoading()
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
      startLoading()
    }
  })

  const guestLogin = () => {
    mutate(({}), {
      onSuccess: () => {
        hideLoginModal()
        refetchMatchPrediction()
        resetLoadingState()
        setReactQueryData<boolean>(QUERY_KEY.GUEST, true)
        showToastModalMessage({ message: MESSAGE.LOGIN_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
      },
      onError: (error: any) => {
        resetLoadingState()
        if (error.data.errorCode === CUSTOM_ERROR_CODE.UNABLE_TO_GENERATE_GUEST_TODAY) {
          showToastModalMessage({ message: MESSAGE.NOT_CREATE_GUEST_BY_LIMIT, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          return
        }
        showToastModalMessage({ message: MESSAGE.LOGIN_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })

      }
    })
  }
  return { guestLogin, isLoading, isSuccess }
}

//! ゲストログアウト
export const useGuestLogout = () => {
  const { refetch: refetchMatchPrediction } = useFetchUsersPrediction()
  // ? react query
  const queryClient = useQueryClient()
  // ? toast message modal
  const { setToastModal, showToastModal } = useToastModal()
  // ? Loading state
  const { resetLoadingState, startLoading, hasError, successful } = useLoading()
  // ? api
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const api = useCallback(async (_: unknown) => {
    await Axios.post<void>(API_PATH.GUEST_LOGOUT).then(result => result.data)
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })
  const guestLogout = useCallback(() => {
    mutate({}, {
      onSuccess: () => {
        // ? ユーザー情報のキャッシュをclear
        refetchMatchPrediction()
        queryClient.setQueryData<boolean>(QUERY_KEY.GUEST, false)
        successful()
        setToastModal({ message: MESSAGE.LOGOUT_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY })
        showToastModal()
        resetLoadingState()
      },
      onError: () => {
        hasError()
        setToastModal({ message: MESSAGE.LOGOUT_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
        resetLoadingState()
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
  const { setToastModal, showToastModal } = useToastModal()
  // ? Loading state (hook)
  const { startLoading, resetLoadingState } = useLoading()

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
      startLoading()
    }
  })
  const preSignUp = ({ name, email, password }: ApiPropsType) => {
    mutate({ name, email, password }, {
      onSuccess: () => {
        resetLoadingState()
      },

      onError: (error: any) => {
        resetLoadingState()
        if (error.status === 422) {
          const errorMessages = error.data.message as any
          if (errorMessages.email) {
            if (errorMessages.email.includes('email is already exists')) {
              setToastModal({ message: MESSAGE.EMAIL_HAS_ALREADY_EXIST, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
              showToastModal()
              return
            }
          }
          if (errorMessages.name) {
            if ((errorMessages.name as string[]).includes('name is already used')) {
              setToastModal({ message: MESSAGE.USER_NAME_ALREADY_USE, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
              showToastModal()
              return
            }
            if ((errorMessages.name as string[]).includes('The name must not be greater than 30 characters.')) {
              setToastModal({ message: MESSAGE.NAME_CHAR_LIMIT_OVER, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
              showToastModal()
              return
            }
          }
          setToastModal({ message: MESSAGE.SIGNUP_LACK_INPUT, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          showToastModal()
          return
        }

        setToastModal({ message: MESSAGE.USER_REGISTER_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
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
  const { setToastModal, showToastModal } = useToastModal()
  // ? Loading state
  const { resetLoadingState, startLoading, hasError, successful } = useLoading()
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
      startLoading()
    }
  })
  const login = (props: { email: string, password: string }) => {
    mutate({ ...props }, {
      // ! ログイン成功時
      onSuccess: (userData) => {
        refetchMatchPrediction()
        hideLoginModal()
        resetLoadingState()
        refetchAdmin()
        // ? ログインユーザーをreact query内でキャッシュする
        setReactQueryData<UserType | boolean>(QUERY_KEY.AUTH, userData)
        successful()
        setToastModal({ message: MESSAGE.LOGIN_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()

      },
      // ! ログイン失敗時
      onError: () => {
        resetLoadingState()
        hasError()
        setToastModal({ message: MESSAGE.LOGIN_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }
  return { login, isLoading, isSuccess }
}

//! ログアウト
export const useLogout = () => {
  const { refetch: refetchMatchPrediction } = useFetchUsersPrediction()
  // ? react query
  const queryClient = useQueryClient()
  // ? toast message modal
  const { setToastModal, showToastModal } = useToastModal()
  // ? Loading state
  const { resetLoadingState, startLoading, hasError, successful } = useLoading()
  // ? api
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const api = useCallback(async (_: any) => {
    await Axios.post<void>(API_PATH.USER_LOGOUT).then(result => result.data)
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })
  const logout = useCallback(() => {
    mutate({}, {
      onSuccess: () => {
        // ? ユーザー情報のキャッシュをclear
        queryClient.setQueryData(QUERY_KEY.AUTH, null)
        queryClient.invalidateQueries(QUERY_KEY.ADMIN)
        refetchMatchPrediction()
        successful()
        setToastModal({ message: MESSAGE.LOGOUT_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY })
        showToastModal()
        resetLoadingState()
      },
      onError: () => {
        hasError()
        setToastModal({ message: MESSAGE.LOGOUT_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
        resetLoadingState()
      }
    })
  }, [])
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
