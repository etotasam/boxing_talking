import React from "react"
import axios from "../axios"

export const usePostComment = () => {
  const [commentPostPending, setCommentPostPending] = React.useState(false)
  const postComment = React.useCallback(async (userId: number, matchId: number, comment: string) => {
    setCommentPostPending(true)
    await axios.post(
      "api/post_comment",
      {
        userId,
        matchId,
        comment,
      })
    setCommentPostPending(false)
  }, [])

  return { postComment, commentPostPending }
}