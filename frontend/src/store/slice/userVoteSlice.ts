import axios from '@/libs/axios';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from "../store"
import { UserType } from "@/store/slice/authUserSlice"


// export enum VoteColor {
//   RED = "red",
//   BLUE = "blue"
// }

export type UserVoteStateType = {
  id: number;
  user_id: number,
  match_id: number,
  vote_for: "red" | "blue" | undefined,
}


type State = {
  votes: UserVoteStateType[] | undefined,
  loading: boolean,
  error: any
}


const initialState: State = {
  votes: undefined,
  loading: true,
  error: undefined
}

export const fetchUserVotes = createAsyncThunk(
  'userVotes',
  async (authUser: UserType) => {
    const { data: userVotes }: { data: UserVoteStateType[] } = await axios.post("/api/get_votes", { userId: authUser.id })
    return userVotes
  }
)

export const userVoteSlice = createSlice({
  name: 'userVote',
  initialState,
  reducers: {
    setVotes: (state: State, action: PayloadAction<UserVoteStateType[] | undefined>) => {
      state.votes = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchUserVotes.pending, (state: State) => {
      state.loading = true
    })
    builder.addCase(fetchUserVotes.rejected, (state: State) => {
      state.loading = false
      state.error = "userVoteの取得失敗"
    })
    builder.addCase(fetchUserVotes.fulfilled, (state: State, action: PayloadAction<UserVoteStateType[]>) => {
      state.loading = false
      state.votes = action.payload
    })
  }
})

// export const userVoteSlice = createSlice({
//   name: `userVote`,
//   initialState,
//   reducers: {
//     setVotes: (state: State, action: PayloadAction<UserVoteStateType[] | undefined>) => {
//       state.votes = action.payload
//     }
//   }
// })

export const { setVotes } = userVoteSlice.actions
export const selectVotes = (state: RootState) => state.userVote.votes
export const selectUserVotesLoading = (state: RootState) => state.userVote.loading
export const selectUserVotesError = (state: RootState) => state.userVote.error
// export const selectAuth = (state: RootState) => state.authUser.auth
// export const selectAuthUser = (state: RootState) => state.authUser
// export const selectChecked = (state: RootState) => state.authUser.hasAuthCkecked
export default userVoteSlice.reducer
