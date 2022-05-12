import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from "../../store"
import { useSelector } from "react-redux"
import { Axios } from "@/libs/axios"

export type initialStateProps = {
  confirmModalVisble: boolean
  idForDelete: number | undefined
  pending: boolean
}

const initialState: initialStateProps = {
  confirmModalVisble: false,
  idForDelete: undefined,
  pending: false
}

type deleteCommentAPIProps = {
  userId: number
  commentId: number
}

export const deleteCommentAPI = createAsyncThunk<any, deleteCommentAPIProps, {}>(
  'dleteCommentAPI',
  async ({ userId, commentId }) => {
    const { data } = await Axios.delete("api/comment", {
      data: {
        user_id: userId,
        comment_id: commentId
      },
    })
    return data
  }
)

export const deleteConfirmModaleSlice = createSlice({
  name: 'deleteConfirmModaleSlice',
  initialState,
  reducers: {
    openDeleteModalReducer: (state: initialStateProps) => {
      state.confirmModalVisble = true
    },
    closeDeleteModalReducer: (state: initialStateProps) => {
      state.confirmModalVisble = false
    },
    defineDeleteCommentIdReducer: (state: initialStateProps, action: PayloadAction<number>) => {
      state.idForDelete = action.payload
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

export const { openDeleteModalReducer, closeDeleteModalReducer, defineDeleteCommentIdReducer } = deleteConfirmModaleSlice.actions
export const useDeleteCommentsState = () => {
  return useSelector((state: RootState) => state.deleteConfirmModalState)
}
// export const useDeleteCommentId = () => {
//   return useSelector((state: RootState) => state.deleteConfirmModalState.deleteCommentId)
// }
// export const useDeletingPending = () => {
//   return useSelector((state: RootState) => state.deleteConfirmModalState.pending)
// }
export default deleteConfirmModaleSlice.reducer