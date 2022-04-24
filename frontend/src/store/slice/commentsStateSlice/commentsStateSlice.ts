import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { UserType } from "@/libs/apis/authAPI";
import { RootState } from "../../store"
import axios, { CancelToken } from "@/libs/axios"
import { useSelector } from 'react-redux';


export type CommentType = {
  id: number;
  user: UserType;
  comment: string;
  created_at: Date;
};

export type InitialStateProps = {
  comments: CommentType[] | [],
  pending: boolean
  hasNotComments: boolean
  error: string
}

const initialState: InitialStateProps = {
  comments: [],
  pending: false,
  hasNotComments: false,
  error: ""
}
let source: any
export const fetchThisMatchesComments = createAsyncThunk<CommentType[], number, {}>(
  `comments/fetchByMatchId`,
  async (matchId: number) => {
    source = CancelToken.source()
    const { data: comments } = await axios.get("api/comment", {
      params: {
        match_id: matchId,
      },
      cancelToken: source.token
    })
    return comments
  }
)

export const commentsStateSlice = createSlice({
  name: `comments/fetchByMatchId`,
  initialState,
  reducers: {
    commentClear: (state: InitialStateProps) => {
      state.comments = []
    },
    LoadingON: (state: InitialStateProps) => {
      state.pending = true
    },
    LoadingOFF: (state: InitialStateProps) => {
      state.pending = false
    },
    cancelGetCommentsAxios: () => {
      source.cancel()
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchThisMatchesComments.pending, (state: InitialStateProps) => {
      if (state.comments.length) {
        state.comments = []
      }
      state.hasNotComments = false
      state.pending = true

    })
    builder.addCase(fetchThisMatchesComments.rejected, (state: InitialStateProps) => {
      state.pending = false
      state.error = "コメントの取得に失敗しました"
    })
    builder.addCase(fetchThisMatchesComments.fulfilled, (state: InitialStateProps, action: PayloadAction<CommentType[]>) => {
      if (action.payload.length) {
        state.hasNotComments = false
      } else {
        state.hasNotComments = true
      }
      state.comments = action.payload
      state.pending = false
    })
  }
})



export const { commentClear, LoadingOFF, LoadingON, cancelGetCommentsAxios } = commentsStateSlice.actions
// export const selectComments = (state: RootState) => state.commentsState.comments
// export const selectCommentsError = (state: RootState) => state.commentsState.error
// export const selectHasNotComments = (state: RootState) => state.commentsState.hasNotComments
// export const selectGettingCommentsState = (state: RootState) => state.commentsState.gettingComments
export const useCommentsState = () => {
  return useSelector((state: RootState) => state.commentsState)
}
// export const useCommentsError = () => {
//   return useSelector((state: RootState) => state.commentsState.error)
// }
// export const useHasNotComment = () => {
//   return useSelector((state: RootState) => state.commentsState.hasNotComments)
// }
// export const useGettingCommentsState = () => {
//   return useSelector<RootState, boolean>((state: RootState) => state.commentsState.gettingComments)
// }
export default commentsStateSlice.reducer
