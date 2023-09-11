import { atom, selector } from "recoil";

type ViewModeType = "PC" | "SP" | undefined

const viewModeState = atom<ViewModeType>({
  key: "viewModeState",
  default: "PC"
})

export const viewModeSelector = selector({
  key: "viewModeSelector",
  get: ({ get }) => {
    const state = get(viewModeState)
    return state
  },
  set: ({ set }, newState) => {
    set(viewModeState, newState)
  }
})