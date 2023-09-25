import { atom, selector } from "recoil";
// ! data
import { initialBoxerDataOnForm } from "@/assets/boxerData";
// ! types
import { BoxerType } from "@/assets/types";


const initialState = initialBoxerDataOnForm

const boxerDataOnFormState = atom<BoxerType>({
  key: "boxerDataOnFormState",
  default: initialState
})

export const boxerDataOnFormSelector = selector({
  key: "boxerDataOnFormSelector",

  get: ({ get }) => {
    const state = get(boxerDataOnFormState)
    return state
  },
  set: ({ set }, newState) => {
    set(boxerDataOnFormState, newState)
  }
})