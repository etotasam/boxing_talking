import { atom, selector } from "recoil";

const headerAndBottomHeightState = atom<Record<"header" | "bottom" | "middleContent", number | undefined>>({
  key: "headerAndBottomHeightState",
  default: { header: undefined, bottom: undefined, middleContent: undefined }
})

export const headerAndBottomHeightSelector = selector({
  key: "headerAndBottomHeightSelector",
  get: ({ get }) => {
    const state = get(headerAndBottomHeightState)
    return state
  },
  set: ({ set }, newState) => {
    set(headerAndBottomHeightState, newState)
  }
})