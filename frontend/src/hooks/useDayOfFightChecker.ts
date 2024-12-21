import { useEffect, useState } from 'react';
import { MatchDataType } from '@/assets/types';
import dayjs from 'dayjs';



export const useDayOfFightChecker = (matchDateString: string | undefined) => {


  const [isDayOnFight, setIsDayOnFight] = useState<boolean>();
  const [isDayAfterFight, setIsDayAfterFight] = useState<boolean>();
  const [isDayBeforeFight, setIsDayBeforeFight] = useState<boolean>()
  //?試合日が今日、もしくは過ぎているか

  useEffect(() => {
    if (!matchDateString) return;
    const matchDate = dayjs(matchDateString);

    const today = dayjs().startOf('day');

    //? 試合日が今日かどうか
    const isDayOnFight = matchDate.isSame(today);
    setIsDayOnFight(isDayOnFight);

    //? 過去の試合かどうか(試合日当日は含まれない)
    const dayAfterFight = dayjs(matchDate)
      .startOf('day')
      .add(1, 'day')
      .subtract(1, 'second');

    const isDayAfterFight = today.isAfter(dayAfterFight)
    setIsDayAfterFight(isDayAfterFight);

    //? 試合前かどうか(試合日当日は含まれない)
    setIsDayBeforeFight(!isDayOnFight && !today.isAfter(dayAfterFight));
  }, [matchDateString]);

  return { isDayOnFight, isDayAfterFight, isDayBeforeFight }
}