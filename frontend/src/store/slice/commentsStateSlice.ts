import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { UserType } from "@/store/slice/authUserSlice";
import { RootState } from "../store"
import axios from "@/libs/axios"

export type CommentType = {
  id: number;
  user: UserType;
  comment: string;
  created_at: Date;
};

type initialStateProps = {
  comments: CommentType[] | [],
  gettingComments: boolean
  hasNotComments: boolean
  error: string
}

const initialState: initialStateProps = {
  comments: [],
  gettingComments: false,
  hasNotComments: false,
  error: ""
}

export const fetchComments = createAsyncThunk<CommentType[], number, {}>(
  `comments/fetchByMatchId`,
  async (matchId: number) => {
    const { data: comments } = await axios.get("api/get_comments", {
      params: {
        match_id: matchId,
      },
    })
    return comments
  }
)

export const commentsStateSlice = createSlice({
  name: `comments/fetchByMatchId`,
  initialState,
  reducers: {
    commentClear: (state: initialStateProps) => {
      state.comments = []
    },
    LoadingON: (state: initialStateProps) => {
      state.gettingComments = true
    },
    LoadingOFF: (state: initialStateProps) => {
      state.gettingComments = false
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchComments.pending, (state: initialStateProps) => {
      state.hasNotComments = false
      state.gettingComments = true

    })
    builder.addCase(fetchComments.rejected, (state: initialStateProps) => {
      state.gettingComments = false
      state.error = "コメントの取得に失敗しました"
    })
    builder.addCase(fetchComments.fulfilled, (state: initialStateProps, action: PayloadAction<CommentType[]>) => {
      if (action.payload.length) {
        state.hasNotComments = false
      } else {
        state.hasNotComments = true
      }
      state.comments = action.payload
      state.gettingComments = false
    })
  }
})

export const { commentClear, LoadingOFF, LoadingON } = commentsStateSlice.actions
export const selectComments = (state: RootState) => state.commentsState.comments
export const selectCommentsError = (state: RootState) => state.commentsState.error
export const selectHasNotComments = (state: RootState) => state.commentsState.hasNotComments
export const selectGettingCommentsState = (state: RootState) => state.commentsState.gettingComments
export default commentsStateSlice.reducer
