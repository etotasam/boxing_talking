import { atomFamily } from "recoil";

const boolTypeName = [
  "IS_SHOW_RESENT_MATCHES",
  "IS_SCROLL"
] as const

export type AtomType = (typeof boolTypeName)[number]

export const boolState = atomFamily<boolean, AtomType>({
  key: "boolState",
  default: false
})