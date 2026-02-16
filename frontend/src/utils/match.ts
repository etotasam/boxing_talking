import dayjs from 'dayjs';
import { MatchDataType } from "@/types";

export const isMatchDatePast = (matchDate: MatchDataType): boolean => {
  const today = dayjs().startOf('day');
  const dayAfterFight = dayjs(matchDate.matchDate)
    .startOf('day')
    .add(1, 'day')
    .subtract(1, 'second');

  return today.isAfter(dayAfterFight);
};
