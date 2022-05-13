import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { queryKeys } from "@/libs/queryKeys"
import { Axios, isAxiosError } from "../axios"
import { useNavigate } from "react-router-dom";

//! message contoller
import { useMessageController } from "@/libs/hooks/messageController";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";


//! custom hooks
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

export const useLogin = () => {
  const queryClient = useQueryClient()
  const { setMessageToModal } = useMessageController()
  const api = useCallback(async (props: LoginPropsType) => {
    try {
      const res = await Axios.post<UserType>("api/login", { ...props }).then(value => value.data)
      setMessageToModal(MESSAGE.MESSAGE_LOGIN_SUCCESS, ModalBgColorType.SUCCESS)
      queryClient.setQueryData(queryKeys.auth, res)
    } catch (error) {
      setMessageToModal(MESSAGE.MESSAGE_LOGIN_FAILD, ModalBgColorType.ERROR)
    }
  }, [])
  const { mutate, isLoading } = useMutation(api)
  const login = (props: LoginPropsType) => {
    mutate({ ...props }, {
      // onSuccess: (data) => {
      //   setMessageToModal(MESSAGE.MESSAGE_LOGIN_SUCCESS, ModalBgColorType.SUCCESS)
      //   queryClient.setQueryData(queryKeys.auth, data)
      // },
      // onSettled: (data, error) => {
      //   if (error) {
      //     setMessageToModal(MESSAGE.MESSAGE_LOGIN_FAILD, ModalBgColorType.ERROR)
      //   }
      // }
    })
  }
  return { login, isLoading }
}

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient()
  const { setMessageToModal } = useMessageController()
  const api = useCallback(async ({ userId }: { userId: number }) => {
    try {
      await Axios.post<void>("api/logout", { user_id: userId }).then(value => value.data)
      queryClient.setQueryData<boolean>(queryKeys.auth, false)
      setMessageToModal(MESSAGE.MESSAGE_LOGOUT, ModalBgColorType.NULL)
      navigate("/");
    } catch (error) {
      setMessageToModal(MESSAGE.MESSAGE_FAILD_LOGOUT, ModalBgColorType.ERROR)
    }
  }, [])

  const { mutate, isLoading } = useMutation(api)
  const logout = useCallback(({ userId }: { userId: number }) => {
    mutate({ userId }, {
      // onSuccess: () => {
      //   queryClient.setQueryData<boolean>(queryKeys.auth, false)
      //   setMessageToModal(MESSAGE.MESSAGE_LOGOUT, ModalBgColorType.NULL)
      //   navigate("/");
      // },
      // onSettled: (error) => {
      //   if (error) {
      //     setMessageToModal(MESSAGE.MESSAGE_FAILD_LOGOUT, ModalBgColorType.ERROR)
      //   }
      // }
    })
  }, [])
  return { logout, isLoading }
}