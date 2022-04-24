import React from "react"
import axios from "../axios"
import {
  fetchThisMatchesComments,
} from "@/store/slice/commentsStateSlice";
import { useDispatch } from "react-redux";
import { openDeleteModalReducer, closeDeleteModalReducer, deleteCommentAPI, useDeleteCommentsState, defineDeleteCommentIdReducer } from "@/store/slice/deleteModalStateSlice"

import { useMessageController } from "@/libs/hooks/messageController"
import { MESSAGE } from "@/libs/utils"
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice"

export const useCommentDelete = () => {
  const dispatch = useDispatch()
  // const [pending, setPending] = React.useState(false)
  const { setMessageToModal } = useMessageController()

  const openDeleteConfirmModale = () => dispatch(openDeleteModalReducer())
  const closeDeleteConfirmModale = () => dispatch(closeDeleteModalReducer())
  const defineDeleteCommentId = (commentId: number) => dispatch(defineDeleteCommentIdReducer(commentId))

  const deleteCommentsState = useDeleteCommentsState()


  type commentDeleteFuncType = {
    userId: number, commentId: number, matchId: number
  }
  const deleteComment = async ({ userId, commentId, matchId }: commentDeleteFuncType): Promise<void> => {
    // setPending(true)
    await dispatch(deleteCommentAPI({ userId, commentId }))
    await dispatch(fetchThisMatchesComments(matchId))
    setMessageToModal(MESSAGE.COMMENT_DELETED, ModalBgColorType.ERROR)
    // setPending(false)
    closeDeleteConfirmModale()
  }

  return { deleteComment, deleteCommentsState, openDeleteConfirmModale, closeDeleteConfirmModale, defineDeleteCommentId }
}