import { configureStore } from '@reduxjs/toolkit'
import authUserReducer from './slice/authUserSlice'
import matchesReducer from './slice/matchesSlice'
import voteReducer from './slice/userVoteSlice'
import messageByPostCommentReducer from './slice/messageByPostCommentSlice'
import commentsReducer from './slice/commentsStateSlice'

export const store = configureStore({
  reducer: {
    authUser: authUserReducer,
    matches: matchesReducer,
    userVote: voteReducer,
    messageByPostMessage: messageByPostCommentReducer,
    commentsState: commentsReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
