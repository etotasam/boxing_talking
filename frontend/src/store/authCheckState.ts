import { atom } from "recoil";

const state = [
  "loading",
  "success",
  "error",
  "idle"
]

type StateType = typeof state[number]


export const authCheckState = atom<StateType>({
  key: "authCheckingState",
  default: "idle"
})