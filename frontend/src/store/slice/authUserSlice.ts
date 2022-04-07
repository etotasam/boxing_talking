import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from "../store"
import axios from "@/libs/axios"
import { useSelector } from "react-redux"

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
  error: boolean
}


const initialState: AuthUserStateType = {
  user: {
    id: NaN,
    name: "",
    email: ""
  },
  auth: AuthIs.UNDEFINED,
  loading: false,
  error: false
}

export const fetchAuthUser = createAsyncThunk(
  `authUser`,
  async () => {
    const { data: authUser }: { data: UserType } = await axios.get(`/api/user`)
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
      state.loading = true
      state.error = false
    })
    builder.addCase(fetchAuthUser.rejected, (state: AuthUserStateType) => {
      state.auth = AuthIs.FALSE
      state.loading = false
      state.error = true
    })
    builder.addCase(fetchAuthUser.fulfilled, (state: AuthUserStateType, action: PayloadAction<UserType>) => {
      state.auth = AuthIs.TRUE
      state.loading = false
      state.user = action.payload
      state.error = false
    })
  }
})

export const { login, logout } = authUserSlice.actions
export const useUser = (): UserType => {
  return useSelector((state: RootState) => state.authUser.user)
}
export const useHasAuth = (): AuthIs => {
  return useSelector((state: RootState) => state.authUser.auth)
}
export const useAuthUserLoading = () => {
  return useSelector((state: RootState) => state.authUser.loading)
}
export const useAuthUserError = () => {
  return useSelector((state: RootState) => state.authUser.error)
}
export default authUserSlice.reducer
