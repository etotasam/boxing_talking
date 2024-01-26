// !Recoil
import { useRecoilState } from "recoil"
import { modalState } from "@/store/modalState"
// import { useEffect } from "react"



export const useMatchInfoModal = () => {

  const [state, setter] = useRecoilState(modalState("MATCH_INFO"))

  const hideMatchInfoModal = () => {
    setter(false)
  }

  const viewMatchInfoModal = () => {
    setter(true)
  }



  return { state, hideMatchInfoModal, viewMatchInfoModal }
}