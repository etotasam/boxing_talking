import { atom, selector } from "recoil";


type StateType = {
  isLoading: boolean,
  isSuccess: boolean,
  isError: boolean
}

const authenticatingState = atom<StateType>({
  key: "authenticatingState",
  default: { isLoading: true, isSuccess: false, isError: false }
})

export const authenticatingSelector = selector({
  key: "authenticatingSelector",

  get: ({ get }) => {
    const state = get(authenticatingState)
    return state
  },
  set: ({ set }, newState) => {
    set(authenticatingState, newState)
  }
})