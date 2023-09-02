import { atom, selector } from "recoil";
// ! types
import { UserType } from "@/assets/types";


const initialState: UserType = {
  id: undefined,
  name: undefined,
  email: undefined,
  administrator: undefined,
}

const userState = atom<UserType>({
  key: "userState",
  default: initialState
})

export const userSelector = selector({
  key: "userSelector",
  // getは以下のように値を加工したりして返す事もできる
  get: ({ get }) => {
    const state = get(userState)
    return state
  },
  set: ({ set }, newState) => {
    set(userState, newState)
  }
})