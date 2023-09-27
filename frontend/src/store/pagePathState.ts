import { atom, selector } from "recoil";


const pagePathState = atom<string>({
  key: "pagePathState",
  default: "/"
})

export const pagePathSelector = selector({
  key: "pagePathSelector",

  get: ({ get }) => {
    const state = get(pagePathState)
    return state
  },
  set: ({ set }, newState) => {
    set(pagePathState, newState)
  }
})