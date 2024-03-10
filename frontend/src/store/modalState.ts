import { atomFamily } from "recoil";

const modalNames = [
  "LOGIN",
  "MATCH_INFO",
  "BOXER_INFO",
  "PREDICTION_VOTE",
  "MENU",
  "MENU_OPEN_BUTTON_STATE",
] as const

export type ModalNameType = (typeof modalNames)[number]

export const modalState = atomFamily<boolean, ModalNameType>({
  key: "modalState",
  default: false
})