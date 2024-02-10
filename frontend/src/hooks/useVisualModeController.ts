// !Recoil
import { useRecoilState } from "recoil"
import { visualModeState, VISUAL_MODE } from "@/store/visualModeState"


export const useVisualModeController = () => {
  const [state, setter] = useRecoilState(visualModeState)

  const visualModeToggleSwitch = () => {
    setter(current => {
      if (current === VISUAL_MODE.STANDARD) {
        return VISUAL_MODE.SIMPLE
      } else {
        return VISUAL_MODE.STANDARD
      }
    })
  }

  return { state, visualModeToggleSwitch }

}