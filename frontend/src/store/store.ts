import { configureStore } from '@reduxjs/toolkit'
import authUserReducer from './slice/authUserSlice'
import matchesReducer from './slice/matchesSlice'

export const store = configureStore({
  reducer: {
    authUser: authUserReducer,
    matches: matchesReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
