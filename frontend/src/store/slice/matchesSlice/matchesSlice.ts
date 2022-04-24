import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from "../../store"
import { useSelector } from "react-redux"
import { fetchMatchesAPI, MatchesType } from '@/libs/apis/matchAPI'

export type InitialStateType = {
  matches: MatchesType[] | undefined
  pending: boolean
  error: boolean
}

const initialState: InitialStateType = {
  matches: undefined,
  pending: false,
  error: false
}

export const fetchMatches = createAsyncThunk(
  'matches',
  async () => {
    const data = await fetchMatchesAPI()
    return data
  }
)

export const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    clearMatchesArray: (state: InitialStateType) => {
      state.matches = []
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchMatches.pending, (state: InitialStateType) => {
      state.pending = true
      state.error = false
    })
    builder.addCase(fetchMatches.rejected, (state: InitialStateType) => {
      state.pending = false
      state.error = true
    })
    builder.addCase(fetchMatches.fulfilled, (state: InitialStateType, action: PayloadAction<MatchesType[] | []>) => {
      state.matches = action.payload
      state.error = false
      state.pending = false
    })
  }
})


export const { clearMatchesArray } = matchesSlice.actions
export const useMatchesState = () => {
  return useSelector((state: RootState) => state.matches)
}
// export const useMatchespending = () => {
//   return useSelector((state: RootState) => state.matches.pending)
// }
// export const useMatchesError = () => {
//   return useSelector((state: RootState) => state.matches.error)
// }
export default matchesSlice.reducer
