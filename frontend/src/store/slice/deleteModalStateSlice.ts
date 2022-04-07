import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from "../store"
import { useSelector } from "react-redux"
import axios from "@/libs/axios"

type initialStateProps = {
  isOpenDeleteConfirmModal: boolean
  deleteCommentId: number | undefined
  pending: boolean
}

const initialState: initialStateProps = {
  isOpenDeleteConfirmModal: false,
  deleteCommentId: undefined,
  pending: false
}

type deleteCommentAPIProps = {
  userId: number
  commentId: number
}

export const deleteCommentAPI = createAsyncThunk<any, deleteCommentAPIProps, {}>(
  'dleteCommentAPI',
  async ({ userId, commentId }) => {
    const { data } = await axios.delete("api/delete_comment", {
      data: {
        userId,
        commentId
      },
    })
    return data
  }
)

export const deleteConfirmModaleSlice = createSlice({
  name: 'matdeleteConfirmModaleSliceches',
  initialState,
  reducers: {
    openDeleteModal: (state: initialStateProps) => {
      state.isOpenDeleteConfirmModal = true
    },
    closeDeleteModal: (state: initialStateProps) => {
      state.isOpenDeleteConfirmModal = false
    },
    setDeleteCommentId: (state: initialStateProps, action: PayloadAction<number>) => {
      state.deleteCommentId = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(deleteCommentAPI.pending, (state: initialStateProps) => {
      state.pending = true
    })
    builder.addCase(deleteCommentAPI.fulfilled, (state: initialStateProps) => {
      state.pending = false
    })
  }
})

export const { openDeleteModal, closeDeleteModal, setDeleteCommentId } = deleteConfirmModaleSlice.actions
export const useIsOpenDeleteConfirmModal = () => {
  return useSelector((state: RootState) => state.deleteConfirmModalState.isOpenDeleteConfirmModal)
}
export const useDeleteCommentId = () => {
  return useSelector((state: RootState) => state.deleteConfirmModalState.deleteCommentId)
}
export const useDeletingPending = () => {
  return useSelector((state: RootState) => state.deleteConfirmModalState.pending)
}
export default deleteConfirmModaleSlice.reducer