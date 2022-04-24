import React from "react"
import { useDispatch } from "react-redux"
import { logoutAPI, useLogoutStateBySlice } from "@/store/slice/authUserSlice"

import { useMessageController } from "@/libs/hooks/messageController";

import { MESSAGE, } from "@/libs/utils"
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice"

export const useLogout = () => {
  const dispatch = useDispatch()
  const logoutState = useLogoutStateBySlice()
  const { setMessageToModal } = useMessageController()

  const logout = React.useCallback(async ({ userId }: { userId: number }) => {
    try {
      await dispatch(logoutAPI({ userId }))
      if (logoutState.error) {
        throw MESSAGE.MESSAGE_FAILD_LOGOUT
      }
      setMessageToModal(MESSAGE.MESSAGE_LOGOUT, ModalBgColorType.NULL)
    } catch (error) {
      setMessageToModal(error as MESSAGE, ModalBgColorType.ERROR)
    }
  }, [])

  return { logout, logoutState }
}