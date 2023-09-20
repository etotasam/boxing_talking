import { atom, selector } from "recoil";


const visualModeState = atom<"simple" | "standard">({
  key: "visualModeState",
  default: "standard"
})

export const visualModeSelector = selector({
  key: "visualModeSelector",

  get: ({ get }) => {
    const state = get(visualModeState)
    return state
  },
  set: ({ set }, newState) => {
    set(visualModeState, newState)
  }
})