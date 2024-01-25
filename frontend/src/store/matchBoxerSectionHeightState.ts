import { atom, selector } from "recoil";

const matchBoxerSectionHeightState = atom<number | undefined>({
  key: "matchBoxerSectionHeightState",
  default: undefined
})

export const matchBoxerSectionHeightSelector = selector({
  key: "matchBoxerSectionHeightSelector",
  get: ({ get }) => {
    const state = get(matchBoxerSectionHeightState)
    return state
  },
  set: ({ set }, newState) => {
    set(matchBoxerSectionHeightState, newState)
  }
})