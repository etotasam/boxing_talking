// !Recoil
import { useSetRecoilState, useRecoilValue } from "recoil"
import { headerHeightSelector } from "@/store/headerHeightState"
// import { useEffect } from "react"



export const useHeaderHeight = () => {

  const setter = useSetRecoilState(headerHeightSelector)
  const state = useRecoilValue(headerHeightSelector)



  return { state, setter }
}