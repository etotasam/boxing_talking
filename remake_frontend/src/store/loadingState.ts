import { atom, selector } from "recoil";

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

const loadingState = atom<LoadingStateType>({
  key: "loadingState",
  default: initialState
})

export const loadingSelector = selector({
  key: "loadingSelector",
  // getは以下のように値を加工したりして返す事もできる
  get: ({ get }) => {
    const state = get(loadingState)
    return state
  },
  set: ({ set }, newState) => {
    set(loadingState, newState)
  }
})