import { atom, selector } from "recoil";


const viewMatchInfoModalState = atom<boolean>({
  key: "viewMatchInfoModalState",
  default: false
})

export const viewMatchInfoModalSelector = selector({
  key: "viewMatchInfoModalSelector",

  get: ({ get }) => {
    const state = get(viewMatchInfoModalState)
    return state
  },
  set: ({ set }, newState) => {
    set(viewMatchInfoModalState, newState)
  }
})