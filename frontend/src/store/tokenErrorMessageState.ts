import { atom, selector } from "recoil";
import { TOKEN_ERROR_MESSAGE } from "@/assets/tokenErrorMessage";


type atomType = typeof TOKEN_ERROR_MESSAGE[keyof typeof TOKEN_ERROR_MESSAGE]

const tokenErrorMessageState = atom<atomType>({
  key: "tokenErrorMessageState",
  default: TOKEN_ERROR_MESSAGE.NULL
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