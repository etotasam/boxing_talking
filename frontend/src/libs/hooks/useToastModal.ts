import React from "react"
import { useQueryState } from "./useQueryState"
import { MESSAGE } from "@/libs/utils"
import { useQueryClient } from "react-query"

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
  const queryClient = useQueryClient()
  // queryClient.setQueryData<ToastModalMessageType>(queryKeys.toastModalMessage, {message, bgColor})

  // const { state } = useQueryState<ToastModalMessageType>(queryKeys.toastModalMessage, { message, bgColor })

  const setToastModalMessage = ({ message, bgColor }: ToastModalMessageType) => {
    queryClient.setQueryData<ToastModalMessageType>(queryKeys.toastModalMessage, { message, bgColor })
  }

  const res = queryClient.getQueryData<ToastModalMessageType>(queryKeys.toastModalMessage)

  if (!res) return
  const { message, bgColor } = res!

  return { setToastModalMessage, message, bgColor }
}