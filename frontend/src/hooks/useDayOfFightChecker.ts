import { useEffect, useState } from 'react';
import { MatchDataType } from '@/assets/types';
import dayjs from 'dayjs';



export const useDayOfFightChecker = (matchData: MatchDataType | undefined) => {


  const [isFightToday, setIsFightToday] = useState<boolean>();
  const [isDayOverFight, setIsDayOverFight] = useState<boolean>();
  //?試合日が今日、もしくは過ぎているか

  useEffect(() => {
    if (!matchData) return;
    const matchDate = dayjs(matchData.matchDate);

    const today = dayjs().startOf('day');

    const isFightToday = matchDate.isSame(today);
    setIsFightToday(isFightToday);

    const dayAfterFight = dayjs(matchDate)
      .startOf('day')
      .add(1, 'day')
      .subtract(1, 'second');
    setIsDayOverFight(today.isAfter(dayAfterFight));
  }, [matchData]);

  return { isFightToday, isDayOverFight }
}