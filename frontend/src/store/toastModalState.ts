import { atom } from "recoil";
import { MessageType, BgColorType } from "@/assets/types"


type StateType = {
  message: MessageType,
  bgColor: BgColorType,
  isShow: boolean
}

export const toastModalState = atom<StateType>({
  key: "toastModalState",
  default: { message: "", bgColor: "null", isShow: false }
})