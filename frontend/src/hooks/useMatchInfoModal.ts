// !Recoil
import { useSetRecoilState, useRecoilValue } from "recoil"
import { viewMatchInfoModalSelector } from "@/store/viewMatchInfoModalState"
// import { useEffect } from "react"



export const useMatchInfoModal = () => {

  const setter = useSetRecoilState(viewMatchInfoModalSelector)
  const state = useRecoilValue(viewMatchInfoModalSelector)


  const hideMatchInfoModal = () => {
    setter(false)
  }

  const viewMatchInfoModal = () => {
    setter(true)
  }



  return { state, hideMatchInfoModal, viewMatchInfoModal }
}