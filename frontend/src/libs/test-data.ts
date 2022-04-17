
// auth user
import { AuthUserStateType, AuthIs } from "@/store/slice/authUserSlice"
import { UserType } from "@/libs/apis/authAPI"

// comments of match
import { InitialStateProps, CommentType } from "@/store/slice/commentsStateSlice"


export const authUserState: AuthUserStateType = {
  auth: {
    user: {
      id: 1,
      name: "auth user",
      email: "authUser@test.com"
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

export const notAuthState: AuthUserStateType = {
  auth: {
    user: {
      id: NaN,
      name: "",
      email: ""
    },
    hasAuth: AuthIs.FALSE,
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

const commentUser = { id: 2, name: "コメントユーザー", email: "commentUser@test.com" }
export const comment = "コメント1"
const comments = [{
  user: commentUser,
  id: 2,
  comment: comment,
  created_at: new Date("2202/04/12")
}]
export const commentsState: InitialStateProps = {
  comments: comments,
  pending: false,
  hasNotComments: false,
  error: "エラーです"
}

