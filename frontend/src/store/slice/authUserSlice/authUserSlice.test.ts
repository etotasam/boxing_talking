import reducer, { loginAPI, logoutAPI, fetchAuthUser, AuthIs, AuthUserStateType } from "."


const initialState: AuthUserStateType = {
  auth: {
    user: {
      id: NaN,
      name: "",
      email: ""
    },
    hasAuth: AuthIs.UNDEFINED,
    pending: false,
    error: false
  },
  login: {
    pending: false,
    error: false
  },
  logout: {
    pending: false,
    error: false
  }
}

describe("authUserSliceのfetchAuthUserのテスト", () => {
  it("fulfilled時、正常に動作している", () => {
    const payload = {
      user: {
        id: 1,
        name: "test name",
        email: "test@test.com"
      }
    }
    const action = { type: fetchAuthUser.fulfilled.type, payload }
    const state = reducer(initialState, action)
    expect(state.auth.user).toEqual(payload)
    expect(state.auth.hasAuth).toEqual(AuthIs.TRUE)
    expect(state.auth.pending).toEqual(false)
    expect(state.auth.error).toEqual(false)
  })
  it("pending時、正常に動作している", () => {
    const action = { type: fetchAuthUser.pending.type }
    const state = reducer(initialState, action)
    expect(state.auth.user).toEqual(initialState.auth.user)
    expect(state.auth.hasAuth).toEqual(AuthIs.UNDEFINED)
    expect(state.auth.pending).toEqual(true)
    expect(state.auth.error).toEqual(false)
  })
  it("rejected時、正常に動作している", () => {
    const action = { type: fetchAuthUser.rejected.type }
    const state = reducer(initialState, action)
    expect(state.auth.user).toEqual(initialState.auth.user)
    expect(state.auth.hasAuth).toEqual(AuthIs.FALSE)
    expect(state.auth.pending).toEqual(false)
    expect(state.auth.error).toEqual(true)
  })
})

describe("authUserSliceのloginAPIのテスト", () => {
  it("fulfilledは正常", () => {
    const payload = {
      user: {
        id: 1,
        name: "test name",
        email: "test@test.com"
      }
    }
    const action = { type: loginAPI.fulfilled.type, payload }
    const state = reducer(initialState, action)
    expect(state.auth.hasAuth).toEqual(AuthIs.TRUE)
    expect(state.auth.user).toEqual(payload)
    expect(state.login.pending).toEqual(false)
    expect(state.login.error).toEqual(false)
  })
  it("pendingは正常", () => {
    const action = { type: loginAPI.pending.type }
    const state = reducer(initialState, action)
    expect(state.auth.hasAuth).toEqual(AuthIs.UNDEFINED)
    expect(state.auth.user).toEqual(initialState.auth.user)
    expect(state.login.pending).toEqual(true)
    expect(state.login.error).toEqual(false)
  })
  it("rejectedは正常", () => {
    const action = { type: loginAPI.rejected.type }
    const state = reducer(initialState, action)
    expect(state.auth.hasAuth).toEqual(AuthIs.UNDEFINED)
    expect(state.auth.user).toEqual(initialState.auth.user)
    expect(state.login.pending).toEqual(false)
    expect(state.login.error).toEqual(true)
  })
})

describe("authUserSliceのlogoutAPIのテスト", () => {
  const initialState = {
    auth: {
      user: {
        id: 1,
        name: "test name",
        email: "test@test.com"
      },
      hasAuth: AuthIs.TRUE,
      pending: false,
      error: false
    },
    login: {
      pending: false,
      error: false
    },
    logout: {
      pending: false,
      error: false
    }
  }
  it("fulfilledは正常", () => {
    const payload = { id: NaN, name: "", email: "" }
    const action = { type: logoutAPI.fulfilled.type, payload }
    const state = reducer(initialState, action)
    expect(state.auth.hasAuth).toEqual(AuthIs.FALSE)
    expect(state.auth.user).toEqual(payload)
    expect(state.login.pending).toEqual(false)
    expect(state.login.error).toEqual(false)
  })
  it("pendingは正常", () => {
    const action = { type: logoutAPI.pending.type }
    const state = reducer(initialState, action)
    expect(state.auth.hasAuth).toEqual(AuthIs.TRUE)
    expect(state.auth.user).toEqual(initialState.auth.user)
    expect(state.logout.pending).toEqual(true)
    expect(state.logout.error).toEqual(false)
  })
  it("rejectedは正常", () => {
    const action = { type: logoutAPI.rejected.type }
    const state = reducer(initialState, action)
    expect(state.auth.hasAuth).toEqual(AuthIs.TRUE)
    expect(state.auth.user).toEqual(initialState.auth.user)
    expect(state.logout.pending).toEqual(false)
    expect(state.logout.error).toEqual(true)
  })
})