import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from "../store"
import axios from "@/libs/axios"

export type UserType = {
  id: number,
  name: string,
  email: string
}

export enum AuthIs {
  TRUE = "TRUE",
  FALSE = "FALSE",
  UNDEFINED = "UNDEFINED"
}

export type AuthUserStateType = {
  user: UserType,
  auth: AuthIs,
  loading: boolean,
  error: any
}


const initialState: AuthUserStateType = {
  user: {
    id: NaN,
    name: "",
    email: ""
  },
  auth: AuthIs.UNDEFINED,
  loading: false,
  error: undefined
}

export const fetchAuthUser = createAsyncThunk(
  `authUser`,
  async () => {
    const { data: authUser } = await axios.get(`/api/user`)
    return authUser
  }
)

export const authUserSlice = createSlice({
  name: `authUser`,
  initialState,
  reducers: {
    login: (state: AuthUserStateType, action: PayloadAction<UserType>) => {
      state.user = action.payload
      state.auth = AuthIs.TRUE
    },
    logout: (state: AuthUserStateType) => {
      state.user = { id: NaN, name: "", email: "" }
      state.auth = AuthIs.FALSE
    },

  },
  extraReducers: builder => {
    builder.addCase(fetchAuthUser.pending, (state: AuthUserStateType) => {
      state.auth = AuthIs.FALSE
      state.loading = true
    })
    builder.addCase(fetchAuthUser.rejected, (state: AuthUserStateType) => {
      state.loading = false
      state.error = "ログインユーザの取得失敗"
    })
    builder.addCase(fetchAuthUser.fulfilled, (state: AuthUserStateType, action: PayloadAction<UserType>) => {
      state.auth = AuthIs.TRUE
      state.loading = false
      state.user = action.payload
    })
  }
})

export const { login, logout } = authUserSlice.actions
export const selectUser = (state: RootState) => state.authUser.user
export const selectAuth = (state: RootState) => state.authUser.auth
export const selectAuthUserLoading = (state: RootState) => state.authUser.loading
export const selectAuthUserError = (state: RootState) => state.authUser.error
export default authUserSlice.reducer
