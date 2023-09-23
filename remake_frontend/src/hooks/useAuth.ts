import { useCallback } from "react"
import { QUERY_KEY } from "@/assets/queryKeys"
import { Axios } from "@/assets/axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { MESSAGE, BG_COLOR_ON_TOAST_MODAL } from "@/assets/statusesOnToastModal"
import { tokenErrorMessageSelector } from "@/store/tokenErrorMessageState"
import { tokenErrorMessages } from "@/assets/tokenErrorMessage"
//! Recoil
import { useSetRecoilState } from "recoil"
import { authenticatingSelector } from "@/store/authenticatingState"
// !hooks
import { useToastModal } from "./useToastModal"
import { useLoading } from "./useLoading"
import { useLoginModal } from "./useLoginModal"
import { useAllFetchMatchPredictionOfAuthUser } from "./uesWinLossPrediction"
import { useReactQuery } from "./useReactQuery"
//! types
import type { UserType } from "@/assets/types"


//! ゲストauthチェック
export const useGuest = () => {

  const api = useCallback(async () => {
    try {
      const res = await Axios.get(`/api/guest/user`).then(value => value.data);
      return Boolean(res);
    } catch (error) {
      return null
    }
  }, [])
  const { data, isLoading, isError } = useQuery<boolean | null>(QUERY_KEY.guest, api, {
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
  const { setToastModal, showToastModal } = useToastModal()
  // ? Loading state
  const { resetLoadingState, startLoading } = useLoading()
  // ? login modal (hook)
  const { hideLoginModal } = useLoginModal()
  const { refetch: refetchMatchPrediction } = useAllFetchMatchPredictionOfAuthUser()

  //? ReactQuery controller
  const { setReactQueryData } = useReactQuery()
  const api = useCallback(async ({ _ }: { _?: unknown }): Promise<void> => {
    await Axios.post<void>('/api/guest/login').then(value => value.data)
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })

  const guestLogin = () => {
    mutate(({}), {
      onSuccess: (data) => {
        hideLoginModal()
        refetchMatchPrediction()
        resetLoadingState()
        setReactQueryData<boolean>(QUERY_KEY.guest, Boolean(data))
        setToastModal({ message: MESSAGE.LOGIN_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
      },
      onError: () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.LOGIN_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()

      }
    })
  }
  return { guestLogin, isLoading, isSuccess }
}

//! ゲストログアウト
export const useGuestLogout = () => {
  // const { refetch: refetchMatchPrediction } = useAllFetchMatchPredictionOfAuthUser()
  // ? react query
  const queryClient = useQueryClient()
  // ? toast message modal
  const { setToastModal, showToastModal } = useToastModal()
  // ? Loading state
  const { resetLoadingState, startLoading, hasError, successful } = useLoading()
  // ? api
  const api = useCallback(async ({ _ }: { _?: unknown }) => {
    await Axios.post<void>("api/guest/logout").then(value => value.data)
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
        queryClient.setQueryData<boolean>(QUERY_KEY.guest, false)
        // queryClient.invalidateQueries(QUERY_KEY.admin)
        //? 勝敗予想のキャッシュをclearしてリフェッチ
        // queryClient.setQueryData(QUERY_KEY.prediction, undefined)
        // refetchMatchPrediction()
        successful()
        setToastModal({ message: MESSAGE.LOGOUT_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY })
        showToastModal()
        // //? ユーザの勝敗予想データのキャッシュを削除
        // queryClient.setQueryData(QUERY_KEY.vote, [])
        // //? auth を削除
        // queryClient.setQueryData<boolean>(QUERY_KEY.auth, false)
        // navigate("/")
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


//! auth check

export const useAuthCheck = () => {

  const api = useCallback(async () => {
    try {
      const res = await Axios.get(`/api/auth/user`).then(value => value.data)
      return Boolean(res)
    } catch (error) {
      return null
    }
  }, [])
  const { data, isLoading, isError } = useQuery<boolean | null>(QUERY_KEY.auth, api, {
    retry: false,
    staleTime: Infinity
  })

  return { data, isLoading, isError }
}


//! auth user
export const useAuth = () => {
  const queryClient = useQueryClient()

  const api = useCallback(async () => {
    const res = await Axios.get(`/api/user`).then(value => value.data)
    return res
  }, [])
  const { data, isLoading, isError } = useQuery<UserType | null>(QUERY_KEY.auth, api, {
    retry: false,
    staleTime: Infinity,
    onSuccess: (data) => {
      if (!data) {
        queryClient.setQueryData<UserType | null>(QUERY_KEY.auth, null)
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
    const res = await Axios.post<UserType>(`/api/user/pre_create`, { name, email, password }).then(value => value.data)
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
          const errorMessages = error.data.errors as any
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
  const setAuthenticatingState = useSetRecoilState(authenticatingSelector)
  const setTokenErrorMessage = useSetRecoilState(tokenErrorMessageSelector)

  const api = useCallback(async ({ token }: { token: string }) => {
    try {
      const res = await Axios.post<boolean>(`/api/user/create`, { token }).then(value => value.data)
      setAuthenticatingState({ isLoading: false, isError: false, isSuccess: true })
      return res
    } catch (error: any) {
      const errorMessage = error.data.message
      if (errorMessage === "Expired token") {
        setTokenErrorMessage(tokenErrorMessages.EXPIRED_TOKEN)
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
  // const queryClient = useQueryClient()
  // ? toast modal
  const { setToastModal, showToastModal } = useToastModal()
  // ? Loading state
  const { resetLoadingState, startLoading, hasError, successful } = useLoading()
  // ? login modal (hook)
  const { hideLoginModal } = useLoginModal()
  const { refetch: refetchMatchPrediction } = useAllFetchMatchPredictionOfAuthUser()
  //? ReactQuery controller
  const { setReactQueryData } = useReactQuery()

  const api = useCallback(async (props: { email: string, password: string }) => {
    const res = await Axios.post<UserType>("api/login", { ...props }).then(value => value.data)
    return res
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
        setReactQueryData<UserType | boolean>(QUERY_KEY.auth, userData)
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
  const { refetch: refetchMatchPrediction } = useAllFetchMatchPredictionOfAuthUser()
  // ? react query
  const queryClient = useQueryClient()
  // ? toast message modal
  const { setToastModal, showToastModal } = useToastModal()
  // ? Loading state
  const { resetLoadingState, startLoading, hasError, successful } = useLoading()
  // ? api
  const api = useCallback(async ({ _ }: { _?: any }) => {
    await Axios.post<void>("api/logout").then(value => value.data)
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
        queryClient.setQueryData(QUERY_KEY.auth, null)
        queryClient.invalidateQueries(QUERY_KEY.admin)
        //? 勝敗予想のキャッシュをclearしてリフェッチ
        // queryClient.removeQueries(QUERY_KEY.prediction)
        // queryClient.setQueryData(QUERY_KEY.prediction, undefined)
        refetchMatchPrediction()
        successful()
        setToastModal({ message: MESSAGE.LOGOUT_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY })
        showToastModal()
        // //? ユーザの勝敗予想データのキャッシュを削除
        // queryClient.setQueryData(QUERY_KEY.vote, [])
        // //? auth を削除
        // queryClient.setQueryData<boolean>(QUERY_KEY.auth, false)
        // navigate("/")
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
      const res = await Axios.get(`/api/admin`).then(value => value.data)
      return res
    } catch (error) {
      return null
    }
  }, [])
  const { data: isAdmin, isLoading, isError, refetch } = useQuery<boolean>(QUERY_KEY.admin, api, {
    retry: false,
    staleTime: Infinity
  })

  return { isAdmin, isLoading, isError, refetch }
  // // ? react query
  // const queryClient = useQueryClient()
  // // ? Loading state
  // const { resetLoadingState, startLoading, hasError, successful, endLoading } = useLoading()
  // // ? api
  // const api = useCallback(async ({ userId }: { userId: string | undefined }) => {
  //   const res = await Axios.post<boolean>("api/admin", { user_id: userId }).then(value => value.data)
  //   return res
  // }, [])

  // const { mutate, isLoading, isSuccess } = useMutation(api, {
  //   onMutate: () => {
  //     startLoading()
  //   }
  // })

  // const isAdmin = useCallback(({ userId }: { userId: string | undefined }) => {
  //   mutate({ userId }, {
  //     onSuccess: (isAdmin) => {
  //       queryClient.setQueryData<boolean | undefined>(QUERY_KEY.admin, isAdmin)
  //       resetLoadingState()
  //     },
  //     onError: () => {
  //       console.log("has error on validat admin");
  //       resetLoadingState()
  //     }
  //   })
  // }, [])  
  // return { admin, isLoading, isSuccess }
}
