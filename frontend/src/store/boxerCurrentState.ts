import { atom } from "recoil";
// ! data
import { initialBoxerDataOnForm } from "@/assets/boxerData";
// ! types
import { BoxerType } from "@/types";


const initialState = initialBoxerDataOnForm

export const boxerCurrentState = atom<BoxerType>({
  key: "boxerCurrentState",
  default: initialState
})