import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from "../store"
import { MatchesType } from "@/libs/types"

// type Matches = {
//   id: number,
//   red: FighterType,
//   blue: FighterType,
//   date: string
// }

type State = {
  matches: MatchesType[] | undefined
}

const initialState: State = {
  matches: undefined
}

export const matchesSlice = createSlice({
  name: `matches`,
  initialState,
  reducers: {
    setMatchesState: (state: State, action: PayloadAction<MatchesType[]>) => {
      state.matches = action.payload
    }
  }
})

export const { setMatchesState } = matchesSlice.actions
export const selectMatches = (state: RootState) => state.matches.matches
export default matchesSlice.reducer
