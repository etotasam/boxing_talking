import { atom } from "recoil";

export const FORM_TYPE = {
  LOGIN_FORM: "LOGIN_FORM",
  SIGN_ON_FORM: "SIGN_ON_FORM"
} as const

type StateType = typeof FORM_TYPE[keyof typeof FORM_TYPE]

const initialState = FORM_TYPE.LOGIN_FORM

export const formTypeState = atom<StateType>({
  key: "formTypeState",
  default: initialState
})