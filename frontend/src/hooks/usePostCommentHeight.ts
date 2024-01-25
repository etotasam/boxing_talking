// !Recoil
import { useSetRecoilState, useRecoilValue } from "recoil"
import { postCommentHeightSelector } from "@/store/postCommentHeightState"
// import { useEffect } from "react"



export const usePostCommentHeight = () => {

  const setter = useSetRecoilState(postCommentHeightSelector)
  const state = useRecoilValue(postCommentHeightSelector)



  return { state, setter }
}