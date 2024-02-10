import { atom } from "recoil";
// ! data
import { initialBoxerDataOnForm } from "@/assets/boxerData";
// ! types
import { BoxerType } from "@/assets/types";


const initialState = initialBoxerDataOnForm

export const boxerDataOnFormState = atom<BoxerType>({
  key: "boxerDataOnFormState",
  default: initialState
})