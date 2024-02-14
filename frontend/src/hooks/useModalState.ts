// !Recoil
import { useRecoilState } from "recoil"
import { modalState, ModalNameType } from "@/store/modalState"
import { useWindowSize } from "./useWindowSize"

export const useModalState = (modalName: ModalNameType) => {
  const { device } = useWindowSize()
  const [state, setter] = useRecoilState(modalState(modalName))

  const hideModal = () => {
    setter(false)
  }

  const showModal = () => {
    setter(true)
  }

  //? MATCH_INFOとBOXER_INFOはPCサイズの時は閉じる
  if ((modalName === 'MATCH_INFO' || modalName === 'BOXER_INFO') && device === "PC") {
    hideModal()
  }

  return { state, hideModal, showModal }
}