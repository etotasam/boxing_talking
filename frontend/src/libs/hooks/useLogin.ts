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
    await dispatch(loginAPI(props))
    setMessageToModal(MESSAGE.MESSAGE_LOGIN, ModalBgColorType.SUCCESS)
  }, [])

  return { login, loginState }
}