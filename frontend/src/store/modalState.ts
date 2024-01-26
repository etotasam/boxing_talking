import { atomFamily } from "recoil";

const modalNames = [
  "LOGIN",
  "MATCH_INFO"
] as const

type ModalNameType = (typeof modalNames)[number]

export const modalState = atomFamily<boolean, ModalNameType>({
  key: "modalState",
  default: false
})