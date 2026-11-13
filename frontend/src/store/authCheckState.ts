import { atom } from "recoil";

type StateType =
  | 'loading'
  | 'success'
  | 'error'
  | 'idle';


export const authCheckState = atom<StateType>({
  key: "authCheckingState",
  default: "idle"
})