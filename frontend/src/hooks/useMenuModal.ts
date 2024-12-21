// ! recoil
import { useRecoilState } from "recoil"
import { modalState } from "@/store/modalState"

export const useMenuModal = () => {
  const [state, setState] = useRecoilState(modalState("MENU"))

  const show = () => {
    setState(true)
  }
  const hide = () => {
    setState(false)
  }
  const toggle = () => {
    setState(curr => {
      return !curr
    })
  }
  return { state, show, hide, toggle }
}
