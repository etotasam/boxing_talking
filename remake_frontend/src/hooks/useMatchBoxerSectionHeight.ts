// !Recoil
import { useSetRecoilState, useRecoilValue } from "recoil"
import { matchBoxerSectionHeigthtSelector } from "@/store/matchBoxerSectionHeigthtState"
// import { useEffect } from "react"



export const useMatchBoxerSectionHeight = () => {

  const setter = useSetRecoilState(matchBoxerSectionHeigthtSelector)
  const state = useRecoilValue(matchBoxerSectionHeigthtSelector)



  return { state, setter }
}