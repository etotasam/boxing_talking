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

export const useAuth = () => {

  const api = useCallback(async () => {
    return await Axios.get(`/api/user`).then(value => value.data)
  }, [])
  const { data, isLoading, isError } = useQuery<UserType>(queryKeys.auth, api, {
    retry: false
  })

  return { data, isLoading, isError }
}

//! ログイン
export const useLogin = () => {
  const queryClient = useQueryClient()
  const { setToastModalMessage } = useToastModal()
  const api = useCallback(async (props: LoginPropsType) => {
    const res = await Axios.post<UserType>("api/login", { ...props }).then(value => value.data)
    return { res }
  }, [])
  const { mutate, isLoading } = useMutation(api)
  const login = (props: LoginPropsType) => {
    mutate({ ...props }, {
      onSuccess: (data) => {
        setToastModalMessage({ message: MESSAGE.MESSAGE_LOGIN_SUCCESS, bgColor: ModalBgColorType.SUCCESS })
        queryClient.setQueryData(queryKeys.auth, data)
      },
      onError: () => {
        setToastModalMessage({ message: MESSAGE.MESSAGE_LOGIN_FAILD, bgColor: ModalBgColorType.ERROR })
      }
    })
  }
  return { login, isLoading }
}
//! ログアウト
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient()
  const { setToastModalMessage } = useToastModal()
  const api = useCallback(async ({ userId }: { userId: number }) => {
    await Axios.post<void>("api/logout", { user_id: userId }).then(value => value.data)
  }, [])

  const { mutate, isLoading } = useMutation(api)
  const logout = useCallback(({ userId }: { userId: number }) => {
    mutate({ userId }, {
      onSuccess: () => {
        setToastModalMessage({ message: MESSAGE.MESSAGE_LOGOUT, bgColor: ModalBgColorType.NULL })
        queryClient.setQueryData<boolean>(queryKeys.auth, false)
        //? ユーザの勝敗予想データのキャッシュを削除
        queryClient.removeQueries(queryKeys.vote)
        navigate("/")
      },
      onError: () => {
        setToastModalMessage({ message: MESSAGE.MESSAGE_FAILD_LOGOUT, bgColor: ModalBgColorType.ERROR })
      }
    })
  }, [])
  return { logout, isLoading }
}