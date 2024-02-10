// ! recoil
import { useRecoilState } from "recoil"
import { modalState } from "@/store/modalState"

export const useLoginModal = () => {
  const [state, setState] = useRecoilState(modalState("LOGIN"))

  const showLoginModal = () => {
    setState(true)
  }
  const hideLoginModal = () => {
    setState(false)
  }
  const toddleLoginModal = () => {
    setState(curr => {
      return !curr
    })
  }
  return { state, showLoginModal, hideLoginModal, toddleLoginModal }
}
