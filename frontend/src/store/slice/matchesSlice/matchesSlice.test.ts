import reducer, { fetchMatches, InitialStateType } from "."
import { MatchesType } from '@/libs/apis/matchAPI'

// types
import { FighterType, Stance, Nationality } from "@/libs/hooks/fetchers";


const initialState: InitialStateType = {
  matches: undefined,
  pending: false,
  error: false
}

const redFighter: FighterType = {
  id: 1,
  name: "red fighter",
  country: Nationality.Japan,
  birth: "1970-01-01",
  height: 170,
  stance: Stance.Southpaw,
  ko: 1,
  win: 1,
  lose: 1,
  draw: 1,
}
const blueFighter: FighterType = {
  id: 1,
  name: "blue fighter",
  country: Nationality.USA,
  birth: "1970-01-01",
  height: 170,
  stance: Stance.Orthodox,
  ko: 2,
  win: 2,
  lose: 2,
  draw: 2,
}

describe("matchesSliceのテスト", () => {
  it("fulfilled", () => {
    const payload: MatchesType[] = [{
      id: 1,
      date: new Date("2022-04-15"),
      red: redFighter,
      blue: blueFighter,
      count_red: 10,
      count_blue: 20
    }]
    const action = { type: fetchMatches.fulfilled.type, payload }
    const state = reducer(initialState, action)
    expect(state.matches).toEqual(payload)
    expect(state.error).toEqual(false)
    expect(state.pending).toEqual(false)
  })
  it("pending", () => {
    const action = { type: fetchMatches.pending.type }
    const state = reducer(initialState, action)
    expect(state.matches).toEqual(undefined)
    expect(state.error).toEqual(false)
    expect(state.pending).toEqual(true)
  })
  it("rejected", () => {
    const action = { type: fetchMatches.rejected.type }
    const state = reducer(initialState, action)
    expect(state.matches).toEqual(undefined)
    expect(state.error).toEqual(true)
    expect(state.pending).toEqual(false)
  })
})