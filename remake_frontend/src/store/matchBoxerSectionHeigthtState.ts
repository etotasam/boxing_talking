import { atom, selector } from "recoil";

const matchBoxerSectionHeigthtState = atom<number | undefined>({
  key: "matchBoxerSectionHeigthtState",
  default: undefined
})

export const matchBoxerSectionHeigthtSelector = selector({
  key: "matchBoxerSectionHeigthtSelector",
  get: ({ get }) => {
    const state = get(matchBoxerSectionHeigthtState)
    return state
  },
  set: ({ set }, newState) => {
    set(matchBoxerSectionHeigthtState, newState)
  }
})