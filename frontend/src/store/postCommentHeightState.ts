import { atom, selector } from "recoil";

const postCommentHeightState = atom<number | undefined>({
  key: "postCommentHeightState",
  default: undefined
})

export const postCommentHeightSelector = selector({
  key: "postCommentHeightSelector",
  get: ({ get }) => {
    const state = get(postCommentHeightState)
    return state
  },
  set: ({ set }, newState) => {
    set(postCommentHeightState, newState)
  }
})