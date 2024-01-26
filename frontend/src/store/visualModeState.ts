import { atom } from "recoil";


export const visualModeState = atom<"simple" | "standard">({
  key: "visualModeState",
  default: "standard"
})