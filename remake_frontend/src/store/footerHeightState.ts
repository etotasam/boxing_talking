import { atom, selector } from "recoil";

const footerHeightState = atom<number | undefined>({
  key: "footerHeightState",
  default: undefined
})

export const footerHeightSelector = selector({
  key: "footerHeightSelector",
  get: ({ get }) => {
    const state = get(footerHeightState)
    return state
  },
  set: ({ set }, newState) => {
    set(footerHeightState, newState)
  }
})