import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from "../store"
import axios from "@/libs/axios"
import { useSelector } from "react-redux"


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
  error: boolean
}

const initialState: State = {
  matches: undefined,
  loading: false,
  error: false
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
      state.error = false
    })
    builder.addCase(fetchMatches.rejected, (state: State) => {
      state.loading = false
      state.error = true
    })
    builder.addCase(fetchMatches.fulfilled, (state: State, action: PayloadAction<MatchesType[] | []>) => {
      state.matches = action.payload
      state.error = false
      state.loading = false
    })
  }
})


export const { setMatchesState } = matchesSlice.actions
export const useMatches = () => {
  return useSelector((state: RootState) => state.matches.matches)
}
export const useMatchesLoading = () => {
  return useSelector((state: RootState) => state.matches.loading)
}
export const useMatchesError = () => {
  return useSelector((state: RootState) => state.matches.error)
}
export default matchesSlice.reducer
