import { atom } from "recoil";

type StateType = {
  isLoading: boolean,
  isSuccess: boolean,
  isError: boolean
}

export const authCheckingState = atom<StateType>({
  key: "authCheckingState",
  default: { isLoading: true, isSuccess: false, isError: false }
})