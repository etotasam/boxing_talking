import { configureStore } from '@reduxjs/toolkit'
import authUserReducer from './slice/authUserSlice'
import matchesReducer from './slice/matchesSlice'
import voteReducer from './slice/allVoteResultSlice'
import messageByPostCommentReducer from './slice/messageByPostCommentSlice'
import commentsReducer from './slice/commentsStateSlice'
import deleteConfirmModalReducer from "./slice/deleteModalStateSlice"
import fightersSliceReducer from "./slice/fightersSlice"

export const store = configureStore({
  reducer: {
    authUser: authUserReducer,
    matches: matchesReducer,
    userVote: voteReducer,
    messageByPostMessage: messageByPostCommentReducer,
    commentsState: commentsReducer,
    deleteConfirmModalState: deleteConfirmModalReducer,
    fighters: fightersSliceReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
