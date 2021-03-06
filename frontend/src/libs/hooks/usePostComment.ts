import React from "react"
import { Axios } from "../axios"

import { useMessageController } from "@/libs/hooks/messageController"

import { MESSAGE } from "@/libs/utils"
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice"

//API
import { commentPostAPI } from "@/libs/apis/commentPostAPI"

export const usePostComment = () => {
  const [commentPosting, setCommentPosting] = React.useState(false)

  const { setMessageToModal } = useMessageController()

  const postComment = React.useCallback(async (userId: number, matchId: number, comment: string) => {
    setCommentPosting(true)
    try {
      await commentPostAPI({ matchId, userId, comment })
      // await axios.post(
      //   "api/comment",
      //   {
      //     userId,
      //     matchId,
      //     comment,
      //   })
      setMessageToModal(MESSAGE.COMMENT_POST_SUCCESSFULLY, ModalBgColorType.SUCCESS)
    } catch (error) {
      setMessageToModal(MESSAGE.COMMENT_POST_FAILED, ModalBgColorType.ERROR)
    }
    setCommentPosting(false)
  }, [])

  return { postComment, commentPosting }
}