// !Recoil
import { useRecoilValue, useSetRecoilState } from "recoil"
import { visualModeSelector } from "@/store/visualModeState"

export const useVisualModeController = () => {
  const state = useRecoilValue(visualModeSelector)
  const setter = useSetRecoilState(visualModeSelector)

  const visualModeToggleSwitch = () => {
    setter(current => {
      if (current === "standard") {
        return "simple"
      } else {
        return "standard"
      }
    })
  }

  return { state, visualModeToggleSwitch }

}