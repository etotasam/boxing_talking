import React from "react"
import { useDispatch } from "react-redux"
import { useLoginStateBySlice, loginAPI } from "@/store/slice/authUserSlice"

import { useMessageController } from "@/libs/hooks/messageController";

import { MESSAGE, } from "@/libs/utils"
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice"

export type LoginProps = {
  email: string,
  password: string
}

export const useLogin = () => {
  const dispatch = useDispatch()
  const loginState = useLoginStateBySlice()
  const { setMessageToModal } = useMessageController()

  const login = React.useCallback(async (props: LoginProps) => {
    const res: any = await dispatch(loginAPI(props))
    if (res.type === "auth/login/rejected") {
      setMessageToModal(MESSAGE.MESSAGE_LOGIN_FAILD, ModalBgColorType.ERROR)
      return
    }
    setMessageToModal(MESSAGE.MESSAGE_LOGIN_SUCCESS, ModalBgColorType.SUCCESS)
  }, [])

  return { login, loginState }
}