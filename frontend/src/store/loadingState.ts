import { atom } from "recoil";

type LoadingStateType = {
  isSuccess: boolean | undefined,
  isLoading: boolean | undefined,
  isError: boolean | undefined
}


const initialState: LoadingStateType = {
  isSuccess: undefined,
  isLoading: undefined,
  isError: undefined,
}

export const loadingState = atom<LoadingStateType>({
  key: "loadingState",
  default: initialState
})