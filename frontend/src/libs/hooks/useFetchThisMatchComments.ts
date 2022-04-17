import React from "react"
import { useDispatch } from "react-redux"

import { fetchThisMatchesComments, useCommentsState, commentClear, cancelGetCommentsAxios } from "@/store/slice/commentsStateSlice"

export const useFetchThisMatchComments = () => {

  const dispatch = useDispatch()

  // comments取得の状態
  const commentsState = useCommentsState()

  // commentsを空にする
  const clearComments = () => dispatch(commentClear())

  // axiosのキャンセル
  const cancelFetchComments = () => dispatch(cancelGetCommentsAxios())

  const fetchThisMatchComments = (matchId: number) => dispatch(fetchThisMatchesComments(matchId))

  return { fetchThisMatchComments, commentsState, clearComments, cancelFetchComments }
}