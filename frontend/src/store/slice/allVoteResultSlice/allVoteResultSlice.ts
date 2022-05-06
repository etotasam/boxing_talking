import { Axios } from '@/libs/axios';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from "../../store"
// import { UserType } from "@/libs/apis/authAPI"
import { useSelector } from "react-redux"


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


type InitialStateType = {
  votes: UserVoteStateType[] | undefined,
  pending: boolean,
  error: boolean
}


const initialState: InitialStateType = {
  votes: undefined,
  pending: true,
  error: false
}

export const fetchUserVotes = createAsyncThunk(
  'userVotes',
  async (userId: number) => {
    const { data: userVotes }: { data: UserVoteStateType[] } = await Axios.get(`/api/vote/${userId}`)
    return userVotes
  }
)

export const userVoteSlice = createSlice({
  name: 'userVote',
  initialState,
  reducers: {
    setVotes: (state: InitialStateType, action: PayloadAction<UserVoteStateType[] | undefined>) => {
      state.votes = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchUserVotes.pending, (state: InitialStateType) => {
      state.pending = true
      state.error = false
    })
    builder.addCase(fetchUserVotes.rejected, (state: InitialStateType) => {
      state.pending = false
      state.error = true
    })
    builder.addCase(fetchUserVotes.fulfilled, (state: InitialStateType, action: PayloadAction<UserVoteStateType[]>) => {
      state.pending = false
      state.error = false
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
// export const selectVotes = (state: RootState) => state.userVote.votes
// export const selectUserVotesLoading = (state: RootState) => state.userVote.pending
// export const selectUserVotesError = (state: RootState) => state.userVote.error
export const useVoteResultState = () => {
  return useSelector((state: RootState) => state.userVote)
}
// export const useUserVotesLoading = () => {
//   return useSelector((state: RootState) => state.userVote.pending)
// }
// export const useUserVotesError = () => {
//   return useSelector((state: RootState) => state.userVote.error)
// }
export default userVoteSlice.reducer
