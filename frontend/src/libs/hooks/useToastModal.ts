import React from "react"
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
}

type ToastModalMessageType = {
  message: MESSAGE,
  bgColor: ModalBgColorType
}

export const useToastModal = () => {

  const { state, setter } = useQueryState<ToastModalMessageType>(queryKeys.toastModalMessage, { message: MESSAGE.NULL, bgColor: ModalBgColorType.NULL })
  const setToastModalMessage = ({ message, bgColor }: ToastModalMessageType) => {
    setter({ message, bgColor })
  }
  const { message, bgColor } = state

  const clearToastModaleMessage = () => setter({ message: MESSAGE.NULL, bgColor: ModalBgColorType.NULL })

  return { setToastModalMessage, message, bgColor, clearToastModaleMessage }
}