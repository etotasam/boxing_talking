import { atom, selector } from "recoil";

// type LoginModalStateType = {
//   isShow: boolean
// }

export const loginModalState = atom<boolean>({
  key: "loginModalState",
  default: false
})

export const loginModalSelector = selector({
  key: "loginModalSelector",
  get: ({ get }) => {
    const state = get(loginModalState)
    return state
  },
  set: ({ set }, newState) => {
    set(loginModalState, newState)
  }
})