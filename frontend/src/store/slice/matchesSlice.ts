import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from "../store"
import axios from "@/libs/axios"

export type FighterType = {
  id: number,
  name: string,
  country: string,
  ko: number,
  win: number,
  lose: number,
  draw: number
}

export type MatchesType = {
  id: number;
  date: string;
  red: FighterType;
  blue: FighterType;
  count_red: number;
  count_blue: number;
};

type State = {
  matches: MatchesType[] | undefined
  loading: boolean
  error: any
}

const initialState: State = {
  matches: undefined,
  loading: false,
  error: undefined
}

export const fetchMatches = createAsyncThunk(
  'matches',
  async () => {
    const { data: MatchesData }: { data: MatchesType[] } = await axios.get(
      "api/match"
    );
    return MatchesData
  }
)

export const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setMatchesState: (state: State, action: PayloadAction<MatchesType[]>) => {
      state.matches = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchMatches.pending, (state: State) => {
      state.loading = true
    })
    builder.addCase(fetchMatches.rejected, (state: State) => {
      state.loading = false
      state.error = "fetchMatchでエラーです"
    })
    builder.addCase(fetchMatches.fulfilled, (state: State, action: PayloadAction<MatchesType[] | []>) => {
      state.matches = action.payload
      state.loading = false
    })
  }
})


export const { setMatchesState } = matchesSlice.actions
export const selectMatches = (state: RootState) => state.matches.matches
export const selectMatchesLoading = (state: RootState) => state.matches.loading
export const selectMatchesError = (state: RootState) => state.matches.error
export default matchesSlice.reducer
