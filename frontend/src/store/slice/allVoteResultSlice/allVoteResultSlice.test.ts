import reducer, { fetchUserVotes, UserVoteStateType } from "."

const initialState = {
  votes: undefined,
  pending: true,
  error: false
}

describe("allVoteREsultSliceのテスト", () => {
  it("fulfilled", () => {
    const payload: UserVoteStateType[] = [{
      id: 1,
      user_id: 1,
      match_id: 1,
      vote_for: "red",
    },
    {
      id: 2,
      user_id: 2,
      match_id: 2,
      vote_for: undefined,
    }]
    const action = { type: fetchUserVotes.fulfilled.type, payload }
    const state = reducer(initialState, action)
    expect(state.votes).toEqual(payload)
    expect(state.pending).toEqual(false)
    expect(state.error).toEqual(false)
  })
  it("pending", () => {
    const action = { type: fetchUserVotes.pending.type }
    const state = reducer(initialState, action)
    expect(state.votes).toEqual(undefined)
    expect(state.pending).toEqual(true)
    expect(state.error).toEqual(false)
  })
  it("rejected", () => {
    const action = { type: fetchUserVotes.rejected.type }
    const state = reducer(initialState, action)
    expect(state.votes).toEqual(undefined)
    expect(state.pending).toEqual(false)
    expect(state.error).toEqual(true)
  })
})