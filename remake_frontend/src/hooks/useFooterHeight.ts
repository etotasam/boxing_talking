// !Recoil
import { useSetRecoilState, useRecoilValue } from "recoil"
import { footerHeightSelector } from "@/store/footerHeightState"
// import { useEffect } from "react"



export const useFooterHeight = () => {

  const setter = useSetRecoilState(footerHeightSelector)
  const state = useRecoilValue(footerHeightSelector)



  return { state, setter }
}