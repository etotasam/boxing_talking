// !Recoil
import { useSetRecoilState, useRecoilValue } from "recoil"
import { matchBoxerSectionHeightSelector } from "@/store/matchBoxerSectionHeightState"
// import { useEffect } from "react"



export const useMatchBoxerSectionHeight = () => {

  const setter = useSetRecoilState(matchBoxerSectionHeightSelector)
  const state = useRecoilValue(matchBoxerSectionHeightSelector)



  return { state, setter }
}