// !Recoil
import { useRecoilState } from "recoil"
import { visualModeState } from "@/store/visualModeState"

export const useVisualModeController = () => {
  const [state, setter] = useRecoilState(visualModeState)

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