import reducer, { fetchThisMatchesComments, InitialStateProps, CommentType } from "."
import { UserType } from "@/libs/apis/authAPI";

const user: UserType = {
  id: 1,
  name: "user name",
  email: "test@test.com"
}

const comment: CommentType = {
  id: 1,
  user: user,
  comment: "コメント",
  created_at: new Date("2022/4/15")
}

const initialState: InitialStateProps = {
  comments: [],
  pending: false,
  hasNotComments: false,
  error: ""
}

describe("commentsStateSliceのテスト", () => {
  it("fulfilled(コメント投稿がある時)", () => {
    const payload: CommentType[] = [comment]
    const action = { type: fetchThisMatchesComments.fulfilled.type, payload }
    const state = reducer(initialState, action)
    expect(state.comments).toEqual(payload)
    expect(state.pending).toEqual(false)
    expect(state.hasNotComments).toEqual(false)
    expect(state.error).toEqual("")
  })
  it("fulfilled(コメント投稿がない時)", () => {
    const payload: CommentType[] = []
    const action = { type: fetchThisMatchesComments.fulfilled.type, payload }
    const state = reducer(initialState, action)
    expect(state.comments).toEqual(payload)
    expect(state.pending).toEqual(false)
    expect(state.hasNotComments).toEqual(true)
    expect(state.error).toEqual("")
  })
  it("pending", () => {
    const action = { type: fetchThisMatchesComments.pending.type }
    const state = reducer(initialState, action)
    expect(state.comments).toEqual([])
    expect(state.pending).toEqual(true)
    expect(state.hasNotComments).toEqual(false)
    expect(state.error).toEqual("")
  })
  it("rejected", () => {
    const action = { type: fetchThisMatchesComments.rejected.type }
    const state = reducer(initialState, action)
    expect(state.comments).toEqual([])
    expect(state.pending).toEqual(false)
    expect(state.hasNotComments).toEqual(false)
    expect(state.error).toEqual("コメントの取得に失敗しました")
  })
})