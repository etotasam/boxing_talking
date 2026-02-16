import { atom } from "recoil"

export const fullScreenLoadingState = atom<boolean>({
  key: "fullScreenLoadingState",
  default: false
})