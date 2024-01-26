import { atom } from "recoil";

export const VISUAL_MODE = {
  SIMPLE: "SIMPLE",
  STANDARD: "STANDARD"
} as const

type VisualType = typeof VISUAL_MODE[keyof typeof VISUAL_MODE]

export const visualModeState = atom<VisualType>({
  key: "visualModeState",
  default: VISUAL_MODE.STANDARD
})