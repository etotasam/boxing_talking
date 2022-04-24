import React from "react"
import { useDispatch } from "react-redux"
import {
  useMessage,
  setMessage,
  messageClear,
  useBgColor,
  ModalBgColorType,
} from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";

export const useMessageController = () => {
  const dispatch = useDispatch()

  const setMessageToModal = async (message: MESSAGE, bgColor: ModalBgColorType) => {
    dispatch(setMessage({ message, bgColor }));
  }

  const clearMessageOnModal = React.useCallback(() => {
    dispatch(messageClear())
  }, [])

  const message = useMessage()
  const bgColor = useBgColor()

  return { setMessageToModal, clearMessageOnModal, bgColor, message }
}