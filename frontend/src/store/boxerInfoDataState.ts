import { atom } from "recoil";
import { BoxerType } from "@/assets/types";

type boxerInfoDataState = BoxerType & { color: "red" | "blue" }
export const boxerInfoDataState = atom<boxerInfoDataState>({
  key: "boxerInfoDataState",
  default: undefined
})