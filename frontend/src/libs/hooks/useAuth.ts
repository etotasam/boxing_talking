import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { queryKeys } from "@/libs/queryKeys"
import { Axios, isAxiosError } from "../axios"
import { useNavigate } from "react-router-dom";

//! message contoller
import { useToastModal, ModalBgColorType } from "./useToastModal";
import { MESSAGE } from "@/libs/utils";


//! custom hooks
import { useFetchMatchPredictVote } from "@/libs/hooks/useMatchPredict"
import { useQueryState } from "@/libs/hooks/useQueryState"

export type UserType = {
  id: number,
  name: string,
  email: string,
  administrator?: boolean
}

export enum AuthIs {
  TRUE = "TRUE",
  FALSE = "FALSE",
  UNDEFINED = "UNDEFINED"
}

export type AuthUserStateType = {
  auth: {
    user: UserType,
    hasAuth: AuthIs,
    pending: boolean,
    error: boolean
  }
  login: {
    pending: boolean,
    error: boolean
  }
  logout: {
    pending: boolean,
    error: boolean
  }
}

type LoginPropsType = {
  email: string,
  password: string
}

//! authチェック
export const useAuth = () => {

  const api = useCallback(async () => {
    return await Axios.get(`/api/user`).then(value => value.data)
  }, [])
  const { data, isLoading, isError } = useQuery<UserType>(queryKeys.auth, api, {
    retry: false,
    staleTime: Infinity
  })

  return { data, isLoading, isError }
}

//! ユーザ作成
export const useCreateUser = () => {

  type ApiPropsType = {
    name: string,
    email: string,
    password: string
  }
  const { setter: setIsOpenSignUpModal } = useQueryState<boolean>("q/isOpenSignUpModal")
  const { setToastModalMessage } = useToastModal()
  const api = useCallback(async ({ name, email, password }: ApiPropsType) => {
    return await Axios.post(`/api/user/create`, { name, email, password }).then(value => value.data)
  }, [])
  const { mutate, isLoading, isSuccess } = useMutation(api)
  const createUser = ({ name, email, password }: ApiPropsType) => {
    mutate({ name, email, password }, {
      onSuccess: () => {
        setToastModalMessage({ message: MESSAGE.USER_REGISTER_SUCCESSFULLY, bgColor: ModalBgColorType.SUCCESS })
        setIsOpenSignUpModal(false)
      },
      onError: (error: any) => {
        if (error.data.message === 'user already exists') {
          setToastModalMessage({ message: MESSAGE.USER_ALREADY_EXIST, bgColor: ModalBgColorType.NOTICE })
          return
        }
        if (error.data.message === 'name already use') {
          setToastModalMessage({ message: MESSAGE.USER_NAME_ALREADY_USE, bgColor: ModalBgColorType.NOTICE })
          return
        }
      }
    })
  }
  return { createUser, isLoading, isSuccess }
}

//! ログイン
export const useLogin = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setter: setIsPendingLogin } = useQueryState<boolean>("q/isPendingLogin", false)
  const { setToastModalMessage } = useToastModal()
  const api = useCallback(async (props: LoginPropsType) => {
    const res = await Axios.post<UserType>("api/login", { ...props }).then(value => value.data)
    return res
  }, [])
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      setIsPendingLogin(true)
    }
  })
  const login = (props: LoginPropsType) => {
    mutate({ ...props }, {
      onSuccess: (data) => {
        setIsPendingLogin(false)
        queryClient.invalidateQueries(queryKeys.vote)
        queryClient.setQueryData(queryKeys.auth, data)
        setToastModalMessage({ message: MESSAGE.MESSAGE_LOGIN_SUCCESS, bgColor: ModalBgColorType.SUCCESS })
        if (data.administrator) {
          navigate('/fighter/register')
        }
      },
      onError: () => {
        setIsPendingLogin(false)
        setToastModalMessage({ message: MESSAGE.MESSAGE_LOGIN_FAILD, bgColor: ModalBgColorType.ERROR })
      }
    })
  }
  return { login, isLoading, isSuccess }
}
//! ログアウト
export const useLogout = () => {
  const { setter: setIsPendingLogout } = useQueryState<boolean>("q/isPendingLogout", false)
  const queryClient = useQueryClient()
  const { setToastModalMessage } = useToastModal()
  const api = useCallback(async ({ userId }: { userId: number }) => {
    await Axios.post<void>("api/logout", { user_id: userId }).then(value => value.data)
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      setIsPendingLogout(true)
    }
  })
  const logout = useCallback(({ userId }: { userId: number }) => {
    mutate({ userId }, {
      onSuccess: () => {
        setIsPendingLogout(false)
        setToastModalMessage({ message: MESSAGE.MESSAGE_LOGOUT, bgColor: ModalBgColorType.GRAY })
        //? ユーザの勝敗予想データのキャッシュを削除
        queryClient.setQueryData(queryKeys.vote, [])
        //? auth を削除
        queryClient.setQueryData<boolean>(queryKeys.auth, false)
        // navigate("/")
      },
      onError: () => {
        setIsPendingLogout(false)
        setToastModalMessage({ message: MESSAGE.MESSAGE_FAILD_LOGOUT, bgColor: ModalBgColorType.ERROR })
      }
    })
  }, [])
  return { logout, isLoading, isSuccess }
}