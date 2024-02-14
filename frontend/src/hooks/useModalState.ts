// !Recoil
import { useRecoilState } from "recoil"
import { modalState, ModalNameType } from "@/store/modalState"

export const useModalState = (modalName: ModalNameType) => {
  const [state, setter] = useRecoilState(modalState(modalName))

  const hideModal = () => {
    setter(false)
  }

  const showModal = () => {
    setter(true)
  }

  return { state, hideModal, showModal }
}