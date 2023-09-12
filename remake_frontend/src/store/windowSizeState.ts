import { atom, selector } from "recoil";

type ViewModeType = "PC" | "SP" | undefined

const windowSizeState = atom<ViewModeType>({
  key: "windowSizeState",
  default: "PC"
})

export const windowSizeSelector = selector({
  key: "windowSizeSelector",
  get: ({ get }) => {
    const state = get(windowSizeState)
    return state
  },
  set: ({ set }, newState) => {
    set(windowSizeState, newState)
  }
})