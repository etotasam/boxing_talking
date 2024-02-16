import _ from "lodash"
import dayjs from 'dayjs';
// ! types
import { MatchDataType } from "@/assets/types"

//? 試合日が過ぎているか
export const isMatchDatePast = (matchDate: MatchDataType): boolean => {
  const today = dayjs().startOf('day');
  const dayAfterFight = dayjs(matchDate.match_date)
    .startOf('day')
    .add(1, 'day')
    .subtract(1, 'second');

  return today.isAfter(dayAfterFight)
}