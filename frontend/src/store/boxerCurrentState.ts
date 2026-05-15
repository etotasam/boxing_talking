import { atom } from "recoil";
import { initialBoxerDataOnForm } from "@/constants/boxerData";
import { BoxerType } from "@/types";


const initialState = initialBoxerDataOnForm

export const boxerCurrentState = atom<BoxerType>({
  key: "boxerCurrentState",
  default: initialState
})