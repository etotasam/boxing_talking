
// auth user
import { AuthUserStateType, AuthIs } from "@/store/slice/authUserSlice"
import { UserType } from "@/libs/apis/authAPI"

// comments of match
import { InitialStateProps, CommentType } from "@/store/slice/commentsStateSlice"


// fighter
import { FighterType, Nationality, Stance } from "@/libs/types/fighter"

export const test_data_fighter_1: FighterType = {
  id: 1,
  name: "選手名1",
  country: Nationality.Japan,
  birth: "1981-04-22",
  height: 180,
  stance: Stance.Orthodox,
  ko: 1,
  win: 1,
  lose: 1,
  draw: 1,
}
export const test_data_fighter_2: FighterType = {
  id: 2,
  name: "選手名2",
  country: Nationality.Kazakhstan,
  birth: "1980-04-22",
  height: 190,
  stance: Stance.Southpaw,
  ko: 2,
  win: 2,
  lose: 2,
  draw: 2,
}

export const test_data_fighters = [test_data_fighter_1, test_data_fighter_2]

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

