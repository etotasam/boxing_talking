// !Recoil
import { useSetRecoilState, useRecoilValue } from "recoil"
import { headerAndBottomHeightSelector } from "@/store/headerAndBottomHeightState"
// import { useEffect } from "react"



export const useHeaderAndBottomHeight = () => {

  const loadingStateSetter = useSetRecoilState(headerAndBottomHeightSelector)
  const data = useRecoilValue(headerAndBottomHeightSelector)


  const state = Object.values(data).reduce((acc, val) => {
    if (typeof val === "number") {
      return acc! + val
    } else {
      return acc
    }
  }, 0);


  const setHeaderHeight = (height: number) => {
    loadingStateSetter(current => {
      return { ...current, header: height }
    })
  }

  const setBottomHeight = (height: number) => {
    loadingStateSetter(current => {
      return { ...current, bottom: height }
    })
  }
  const setMiddleContentHeight = (height: number) => {
    loadingStateSetter(current => {
      return { ...current, middleContent: height }
    })
  }


  return { state, setHeaderHeight, setBottomHeight, setMiddleContentHeight }
}