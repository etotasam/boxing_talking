import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from "../../store"
import axios from "@/libs/axios"
import { useSelector } from "react-redux"
import { UserType, authAPI } from "@/libs/apis/authAPI"

// export type UserType = {
//   id: number,
//   name: string,
//   email: string
// }

export enum AuthIs {
  TRUE = "TRUE",
  FALSE = "FALSE",
  UNDEFINED = "UNDEFINED"
}

export type AuthUserStateType = {
  auth: {
    user: UserType,
    hasAuth: AuthIs,
    pending: boolean,
    error: boolean
  }
  login: {
    pending: boolean,
    error: boolean
  }
  logout: {
    pending: boolean,
    error: boolean
  }
}


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

export const fetchAuthUser = createAsyncThunk(
  `auth/user`,
  async () => {
    const response = await authAPI.getAuthUser()
    return response
  }
)

export const loginAPI = createAsyncThunk(
  `auth/login`,
  async ({ email, password }: { email: string, password: string }) => {
    const response = await authAPI.login({ email, password })
    return response
  }
)

export const logoutAPI = createAsyncThunk(
  `auth/logout`,
  async ({ userId }: { userId: number }) => {
    const response = await authAPI.logout({ userId })
    return response
  }
)

export const authUserSlice = createSlice({
  name: `auth`,
  initialState,
  reducers: {
    // login: (state: AuthUserStateType, action: PayloadAction<UserType>) => {
    //   state.user = action.payload
    //   state.auth = AuthIs.TRUE
    // },
    // logout: (state: AuthUserStateType) => {
    //   state.user = { id: NaN, name: "", email: "" }
    //   state.auth = AuthIs.FALSE
    // },

  },
  extraReducers: builder => {
    //authチェック
    builder.addCase(fetchAuthUser.pending, (state: AuthUserStateType) => {
      state.auth.pending = true
      state.auth.error = false
    })
    builder.addCase(fetchAuthUser.rejected, (state: AuthUserStateType) => {
      state.auth.hasAuth = AuthIs.FALSE
      state.auth.pending = false
      state.auth.error = true
    })
    builder.addCase(fetchAuthUser.fulfilled, (state: AuthUserStateType, action: PayloadAction<UserType>) => {
      state.auth.hasAuth = AuthIs.TRUE
      state.auth.pending = false
      state.auth.user = action.payload
      state.auth.error = false
    })
    //login
    builder.addCase(loginAPI.pending, (state: AuthUserStateType) => {
      state.login.pending = true
      state.login.error = false
    })
    builder.addCase(loginAPI.rejected, (state: AuthUserStateType) => {
      state.login.pending = false
      state.login.error = true
    })
    builder.addCase(loginAPI.fulfilled, (state: AuthUserStateType, action: PayloadAction<UserType>) => {
      state.login.pending = false
      state.auth.user = action.payload
      state.auth.hasAuth = AuthIs.TRUE
    })
    //logout
    builder.addCase(logoutAPI.pending, (state: AuthUserStateType) => {
      state.logout.pending = true
      state.logout.error = false
    })
    builder.addCase(logoutAPI.rejected, (state: AuthUserStateType) => {
      state.logout.pending = false
      state.logout.error = true
    })
    builder.addCase(logoutAPI.fulfilled, (state: AuthUserStateType) => {
      state.logout.pending = false
      state.auth.user = { id: NaN, name: "", email: "" }
      state.auth.hasAuth = AuthIs.FALSE
    })

  }
})

export const useAuthBySlice = () => {
  return useSelector((state: RootState) => state.authUser.auth)
}
export const useLoginStateBySlice = () => {
  return useSelector((state: RootState) => state.authUser.login)
}
export const useLogoutStateBySlice = () => {
  return useSelector((state: RootState) => state.authUser.logout)
}
export default authUserSlice.reducer
