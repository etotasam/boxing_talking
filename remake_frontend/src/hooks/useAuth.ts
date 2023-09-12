import { useCallback } from "react"
import { QUERY_KEY } from "@/assets/queryKeys"
import { Axios } from "@/assets/axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { MESSAGE, BG_COLOR_ON_TOAST_MODAL } from "@/assets/statusesOnToastModal"
// import { useNavigate } from "react-router-dom";

// !hooks
import { useToastModal } from "./useToastModal"
import { useLoading } from "./useLoading"
import { useLoginModal } from "./useLoginModal"
import { useFetchMatchPredictVote } from "./uesWinLossPredition"
//! types
import type { UserType } from "@/assets/types"


//! authチェック
export const useAuth = () => {

  const api = useCallback(async () => {
    try {
      const res = await Axios.get(`/api/user`).then(value => value.data)
      return res
    } catch (error) {
      return null
    }
  }, [])
  const { data, isLoading, isError } = useQuery<UserType>(QUERY_KEY.auth, api, {
    retry: false,
    staleTime: Infinity
  })

  return { data, isLoading, isError }
}

//! ユーザ作成
export const useCreateUser = () => {
  // ? react query
  const queryClient = useQueryClient()
  // ? toast modal
  const { setToastModal, showToastModal } = useToastModal()
  // ? Loading state (hook)
  const { startLoading, hasError, successful } = useLoading()
  // ? login modal (hook)
  const { hideLoginModal } = useLoginModal()

  type ApiPropsType = {
    name: string,
    email: string,
    password: string
  }
  const api = useCallback(async ({ name, email, password }: ApiPropsType) => {
    const res = await Axios.post<UserType>(`/api/user/create`, { name, email, password }).then(value => value.data)
    return res
  }, [])
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })
  const createUser = ({ name, email, password }: ApiPropsType) => {
    mutate({ name, email, password }, {
      onSuccess: (registerUserData) => {
        queryClient.setQueryData<UserType>(QUERY_KEY.auth, registerUserData)
        successful()
        setToastModal({ message: MESSAGE.USER_REGISTER_SUCCESSFULLY, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
        hideLoginModal()
      },

      onError: () => {
        hasError()
        setToastModal({ message: MESSAGE.USER_REGISTER_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }
  return { createUser, isLoading, isSuccess }
}

//! ログイン
export const useLogin = () => {
  const { refetch: refetchAdmin } = useAdmin()
  // ? react query
  const queryClient = useQueryClient()
  // ? toast modal
  const { setToastModal, showToastModal } = useToastModal()
  // ? Loading state
  const { resetLoadingState, startLoading, hasError, successful } = useLoading()
  // ? login modal (hook)
  const { hideLoginModal } = useLoginModal()
  const { refetch: refetchMatchPrediction } = useFetchMatchPredictVote()

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
        queryClient.setQueryData<UserType>(QUERY_KEY.auth, userData)
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
  const { refetch: refetchMatchPrediction } = useFetchMatchPredictVote()
  // ? react query
  const queryClient = useQueryClient()
  // ? toast message modal
  const { setToastModal, showToastModal } = useToastModal()
  // ? Loading state
  const { resetLoadingState, startLoading, hasError, successful } = useLoading()
  // ? api
  const api = useCallback(async ({ userName }: { userName: string }) => {
    await Axios.post<void>("api/logout", { user_name: userName }).then(value => value.data)
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })
  const logout = useCallback(({ userName }: { userName: string }) => {
    mutate({ userName }, {
      onSuccess: () => {
        // ? ユーザー情報のキャッシュをclear
        queryClient.setQueryData(QUERY_KEY.auth, null)
        queryClient.invalidateQueries(QUERY_KEY.admin)
        //? 勝敗予想のキャッシュをclearしてリフェッチ
        queryClient.setQueryData(QUERY_KEY.prediction, undefined)
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
