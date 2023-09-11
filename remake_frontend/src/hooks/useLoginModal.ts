// ! recoil
import { useRecoilState } from "recoil"
import { loginModalSelector } from "@/store/loginModalState"

export const useLoginModal = () => {
  const [state, setState] = useRecoilState(loginModalSelector)

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
