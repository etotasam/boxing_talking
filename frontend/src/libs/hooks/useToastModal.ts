import { useQueryState } from "./useQueryState"
import { MESSAGE } from "@/libs/utils"
import { useQuery, useQueryClient } from "react-query"
import { useRef } from "react"

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

  //? ToastModalのstate
  // const { state: isOpenToastModal, setter: setIsOpenToastModal } = useQueryState<boolean>("q/isOpenToastModal")

  const queryClient = useQueryClient()

  const test_data = useRef<boolean>()
  if (true) {
    test_data.current = queryClient.getQueryData<boolean>("q/isOpenToastModal")
  }
  const isOpenToastModal = useQuery<boolean>("q/isOpenToastModal", { enabled: false, initialData: false }).data as boolean
  const setIsOpenToastModal = (bool: boolean) => queryClient.setQueryData<boolean>("q/isOpenToastModal", bool)

  //? ToastModalに表示するmessageとcolor
  // const { state, setter } = useQueryState<ToastModalMessageType>(queryKeys.toastModalMessage, { message: MESSAGE.NULL, bgColor: ModalBgColorType.NULL })

  const state = useQuery<ToastModalMessageType>(queryKeys.toastModalMessage, { enabled: false, initialData: { message: MESSAGE.NULL, bgColor: ModalBgColorType.NULL } }).data as ToastModalMessageType

  const setter = ({ message, bgColor }: ToastModalMessageType) => queryClient.setQueryData(queryKeys.toastModalMessage, { message, bgColor })

  const setToastModalMessage = ({ message, bgColor }: ToastModalMessageType) => {
    setIsOpenToastModal(true)
    setter({ message, bgColor })
  }
  const { message, bgColor } = state

  const clearToastModaleMessage = () => setIsOpenToastModal(false)

  return { setToastModalMessage, message, bgColor, clearToastModaleMessage, isOpenToastModal }
}