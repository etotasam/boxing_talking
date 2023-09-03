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
  // getは以下のように値を加工したりして返す事もできる
  get: ({ get }) => {
    const state = get(toastModalState)
    return state
  },
  set: ({ set }, newState) => {
    set(toastModalState, newState)
  }
})