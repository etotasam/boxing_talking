import { atom, selector } from "recoil";
import { MessageType, BgColorType } from "@/assets/types"


type StateType = {
  message: MessageType,
  bgColor: BgColorType,
  isShow: boolean
}

const toastModalState = atom<StateType>({
  key: "toastModalState",
  default: { message: "", bgColor: "null", isShow: false }
})

export const toastModalSelector = selector({
  key: "toastModalSelector",

  get: ({ get }) => {
    const state = get(toastModalState)
    return state
  },
  set: ({ set }, newState) => {
    set(toastModalState, newState)
  }
})