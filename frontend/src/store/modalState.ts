import { atomFamily } from "recoil";

const modalNames = [
  "LOGIN",
  "BOXER_INFO",
  "PREDICTION_VOTE",
  "COMMENTS_MODAL",
] as const

export type ModalNameType = (typeof modalNames)[number]

export const modalState = atomFamily<boolean, ModalNameType>({
  key: "modalState",
  default: false
})
