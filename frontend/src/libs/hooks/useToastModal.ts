import { useQueryState } from "./useQueryState"
import { MESSAGE } from "@/libs/utils"

const queryKeys = {
  toastModalMessage: "toastModalMessage"
} as const

export enum ModalBgColorType {
  ERROR = "red",
  SUCCESS = "green",
  DELETE = "gray",
  NOTICE = "blue",
  NULL = "null",
  GRAY = "stone"
}

type ToastModalMessageType = {
  message: MESSAGE,
  bgColor: ModalBgColorType
}

export const useToastModal = () => {

  const { state: isOpenToastModal, setter: setIsOpenToastModal } = useQueryState<boolean>("q/isOpenToastModal")

  const { state, setter } = useQueryState<ToastModalMessageType>(queryKeys.toastModalMessage, { message: MESSAGE.NULL, bgColor: ModalBgColorType.NULL })
  const setToastModalMessage = ({ message, bgColor }: ToastModalMessageType) => {
    setIsOpenToastModal(true)
    setter({ message, bgColor })
  }
  const { message, bgColor } = state

  const clearToastModaleMessage = () => setIsOpenToastModal(false)

  return { setToastModalMessage, message, bgColor, clearToastModaleMessage, isOpenToastModal }
}