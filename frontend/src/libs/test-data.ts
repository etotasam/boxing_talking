
import { UserType } from "@/libs/hooks/useAuth"
import { FighterType, Nationality, Stance } from "@/libs/hooks/useFighter"

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

export const authUser: UserType = {
  id: 1,
  name: "auth user",
  email: "authUser@test.com"
}

const commentUser = { id: 2, name: "コメントユーザー", email: "commentUser@test.com" }
export const comment = "コメント1"
export const comments = [{
  user: commentUser,
  id: 2,
  comment: comment,
  created_at: new Date("2202/04/12")
}]

