import { atom, selector } from "recoil";
import { tokenErrorMessages } from "@/assets/tokenErrorMessage";


type atomType = typeof tokenErrorMessages[keyof typeof tokenErrorMessages]

const tokenErrorMessageState = atom<atomType>({
  key: "tokenErrorMessageState",
  default: tokenErrorMessages.NULL
})

export const tokenErrorMessageSelector = selector({
  key: "tokenErrorMessageSelector",

  get: ({ get }) => {
    const state = get(tokenErrorMessageState)
    return state
  },
  set: ({ set }, newState) => {
    set(tokenErrorMessageState, newState)
  }
})