import { atom, selector } from "recoil";

const headerHeightState = atom<number | undefined>({
  key: "headerHeightState",
  default: undefined
})

export const headerHeightSelector = selector({
  key: "headerHeightSelector",
  get: ({ get }) => {
    const state = get(headerHeightState)
    return state
  },
  set: ({ set }, newState) => {
    set(headerHeightState, newState)
  }
})