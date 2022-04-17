import reducer, { deleteCommentAPI, initialStateProps, defineDeleteCommentIdReducer, openDeleteModalReducer, closeDeleteModalReducer } from "."


describe("deleteModaleStateSliceのテスト", () => {
  const initialState: initialStateProps = {
    confirmModalVisble: false,
    idForDelete: undefined,
    pending: false
  }
  it("fulfilled", () => {
    const initialState: initialStateProps = {
      confirmModalVisble: false,
      idForDelete: undefined,
      pending: true
    }
    const action = { type: deleteCommentAPI.fulfilled.type }
    const state = reducer(initialState, action)
    expect(state.confirmModalVisble).toEqual(initialState.confirmModalVisble)
    expect(state.idForDelete).toEqual(initialState.idForDelete)
    expect(state.pending).toEqual(false)
  })
  it("pending", () => {
    const initialState: initialStateProps = {
      confirmModalVisble: false,
      idForDelete: undefined,
      pending: false
    }
    const action = { type: deleteCommentAPI.pending.type }
    const state = reducer(initialState, action)
    expect(state.confirmModalVisble).toEqual(initialState.confirmModalVisble)
    expect(state.idForDelete).toEqual(initialState.idForDelete)
    expect(state.pending).toEqual(true)
  })
  it("openDeleteModalReducer", () => {
    const action = { type: openDeleteModalReducer.type }
    const state = reducer(initialState, action)
    expect(state.confirmModalVisble).toEqual(true)
    expect(state.idForDelete).toEqual(initialState.idForDelete)
    expect(state.pending).toEqual(initialState.pending)
  })
  it("closeDeleteModalReducer", () => {
    const action = { type: closeDeleteModalReducer.type }
    const state = reducer(initialState, action)
    expect(state.confirmModalVisble).toEqual(false)
    expect(state.idForDelete).toEqual(initialState.idForDelete)
    expect(state.pending).toEqual(initialState.pending)
  })
  it("defineDeleteCommentIdReducer", () => {
    const payload = 5
    const action = { type: defineDeleteCommentIdReducer.type, payload }
    const state = reducer(initialState, action)
    expect(state.confirmModalVisble).toEqual(false)
    expect(state.idForDelete).toEqual(payload)
    expect(state.pending).toEqual(initialState.pending)
  })
})