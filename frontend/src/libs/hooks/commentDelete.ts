import React from "react"
import axios from "../axios"
import {
  fetchThisMatchesComments,
} from "@/store/slice/commentsStateSlice";
import { useDispatch } from "react-redux";
import { useIsOpenDeleteConfirmModal, openDeleteModal, closeDeleteModal, setDeleteCommentId, useDeleteCommentId, deleteCommentAPI, useDeletingPending } from "@/store/slice/deleteModalStateSlice"


export const useCommentDelete = () => {
  const dispatch = useDispatch()
  // const [pending, setPending] = React.useState(false)

  const openDeleteConfirmModale = () => dispatch(openDeleteModal())
  const closeDeleteConfirmModale = () => dispatch(closeDeleteModal())
  const getDeleteCommentId = (id: number) => dispatch(setDeleteCommentId(id))

  const isDeletingPending = useDeletingPending()
  const isOpenDeleteConfirmModal = useIsOpenDeleteConfirmModal()
  const deleteCommentId = useDeleteCommentId()

  const commentDeleteFunc = async (userId: number, commentId: number, matchId: number) => {
    // setPending(true)
    await dispatch(deleteCommentAPI({ userId, commentId }))
    await dispatch(fetchThisMatchesComments(matchId))
    // setPending(false)
    closeDeleteConfirmModale()
  }

  return { commentDeleteFunc, isOpenDeleteConfirmModal, openDeleteConfirmModale, closeDeleteConfirmModale, getDeleteCommentId, deleteCommentId, isDeletingPending }
}