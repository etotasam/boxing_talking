import { configureStore } from '@reduxjs/toolkit'
import authUserReducer from './slice/authUserSlice'

export const store = configureStore({
  reducer: {
    authUser: authUserReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
