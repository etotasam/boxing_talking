import { atom, selector } from "recoil";

export const FORM_TYPE = {
  LOGIN_FORM: "LOGIN_FORM",
  SIGN_ON_FORM: "SIGN_ON_FORM"
} as const

type StateType = typeof FORM_TYPE[keyof typeof FORM_TYPE]

const initialState = FORM_TYPE.LOGIN_FORM

const formTypeState = atom<StateType>({
  key: "formTypeState",
  default: initialState
})

export const formTypeSelector = selector({
  key: "formTypeSelector",
  get: ({ get }) => {
    const state = get(formTypeState)
    return state
  },
  set: ({ set }, newState) => {
    set(formTypeState, newState)
  }
})