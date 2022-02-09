import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from "../store"

type User = {
  id: number,
  name: string
}

type AuthUserState = {
  user: User,
  auth: boolean,
  hasAuthCkecked: boolean
}

const initialState: AuthUserState = {
  user: {
    id: NaN,
    name: ""
  },
  auth: false,
  hasAuthCkecked: false
}

export const authUserSlice = createSlice({
  name: `authUser`,
  initialState,
  reducers: {
    login: (state: AuthUserState, action: PayloadAction<User>) => {
      state.user = action.payload
      state.auth = true
    },
    logout: (state: AuthUserState) => {
      state.user = { id: NaN, name: "" }
      state.auth = false
    },
    checked: (state: AuthUserState) => {
      state.hasAuthCkecked = true
    }
  }
})

export const { login, logout, checked } = authUserSlice.actions
export const selectUser = (state: RootState) => state.authUser.user
export const selectAuth = (state: RootState) => state.authUser.auth
export const selectChecked = (state: RootState) => state.authUser.hasAuthCkecked
export default authUserSlice.reducer
