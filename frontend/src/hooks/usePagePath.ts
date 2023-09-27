// !Recoil
import { useRecoilValue, useSetRecoilState } from "recoil"
import { pagePathSelector } from "@/store/pagePathState"


export const usePagePath = () => {
  const state = useRecoilValue(pagePathSelector)
  const setter = useSetRecoilState(pagePathSelector)

  return { state, setter }
}