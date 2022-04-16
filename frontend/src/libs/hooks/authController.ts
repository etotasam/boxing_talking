import React from "react"
// import { login, logout, useHasAuth } from "@/store/slice/authUserSlice"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom";
import axios, { isAxiosError } from "../axios"
import { useMessageController } from "@/libs/hooks/messageController"
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice"
import { MESSAGE } from "@/libs/utils"


export const useLoginController = () => {
  const [pending, setPending] = React.useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { setMessageToModal } = useMessageController()

  const loginCont = React.useCallback(async (email: string, password: string) => {
    setPending(true)
    const { data } = await axios.post("api/login", {
      email, password
    })
    // dispatch(login(data))
    setMessageToModal(MESSAGE.MESSAGE_LOGIN, ModalBgColorType.SUCCESS)
    setPending(false)
  }, [])

  // const hasAuth = useHasAuth()

  const logoutCont = React.useCallback(async () => {
    try {
      setPending(true)
      await axios.post("api/logout")
      setMessageToModal(MESSAGE.MESSAGE_LOGOUT, ModalBgColorType.DELETE)
      // dispatch(logout())
      setPending(false)
      navigate("/login")
    } catch (error) {
      if (isAxiosError(error)) {
        console.log("エラーです", error);
      }
      setPending(false)
    }
  }, [])

  return { loginCont, logoutCont, pending }
}