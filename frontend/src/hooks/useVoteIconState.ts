import { useState, useEffect } from 'react';
import {
  useFetchUsersPrediction
} from '@/hooks/apiHooks/uesWinLossPrediction';
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
//! type
import { MatchDataType } from '@/assets/types';


type PropsType = Pick<MatchDataType, 'matchDate' | 'id'>
export const useVoteIconState = ({ matchDate, id: matchId }: PropsType) => {
  const [isShowVoteIcon, setIsShowVoteIcon] = useState(false);
  //? 勝敗予想投票実行時の状態hook
  // const { isSuccess: isSuccessVoteMatchPrediction } = useVoteMatchPrediction();
  const { isDayOnFight, isDayAfterFight } = useDayOfFightChecker(matchDate);

  //? userの勝敗予想投票をすべて取得など…
  const { data: usersPredictions } = useFetchUsersPrediction();

  useEffect(() => {

    //? ユーザーの投票をfetch出来てない時は隠す
    if (usersPredictions === undefined) return setIsShowVoteIcon(false);

    //? 過去の試合には表示しない
    if (isDayAfterFight === undefined || isDayAfterFight === true) return setIsShowVoteIcon(false);

    //? 当日は表示しない
    if (isDayOnFight === undefined || isDayOnFight === true) return setIsShowVoteIcon(false);

    //? ユーザーのこの試合への投票の有無
    const isVote = usersPredictions.some((obj) => obj.matchId === matchId);
    setIsShowVoteIcon(!isVote);
  }, [usersPredictions, isDayAfterFight, isDayOnFight, matchId]);

  return isShowVoteIcon;
};

