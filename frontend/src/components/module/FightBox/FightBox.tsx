import { useEffect, useState } from 'react';
import clsx from 'clsx';
// ! types
import { MatchDataType } from '@/assets/types';
// ! components
import { BoxerInfo } from '../BoxerInfo';
import { PredictionVoteIcon } from '@/components/atomic/PredictionVoteIcon';
import { MatchInfo } from '../MatchInfo';
//! hook
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
import { useGuest, useAuth } from '@/hooks/apiHooks/useAuth';

type PropsType = {
  matchData: MatchDataType;
  onClick: (matchId: number) => void;
  className?: string;
  isPredictionVote: boolean | undefined;
};

export const FightBox = ({
  matchData,
  onClick,
  isPredictionVote,
}: PropsType) => {
  const { data: authUser } = useAuth();
  const { data: isGuest } = useGuest();
  const { isFightToday, isDayOverFight } = useDayOfFightChecker(matchData);
  const [isShowPredictionIcon, setIsShowPredictionIcon] = useState(false);

  //? 未投票アイコンの表示条件設定
  useEffect(() => {
    if (isPredictionVote === undefined) return;
    if (authUser === undefined) return;
    if (isGuest === undefined) return;
    if (isDayOverFight === undefined) return;
    if (isFightToday === undefined) return;
    setIsShowPredictionIcon(
      Boolean(
        (authUser || isGuest) &&
          !isPredictionVote &&
          isPredictionVote !== undefined &&
          !isDayOverFight &&
          !isFightToday
      )
    );
  }, [isPredictionVote, authUser, isGuest, isDayOverFight, isFightToday]);
  return (
    <>
      {matchData && (
        <div
          onClick={() => onClick(matchData.id)}
          className={clsx(
            'relative flex justify-between w-[80%] max-w-[1024px] min-w-[900px] cursor-pointer border-[1px] rounded-sm md:hover:bg-yellow-100 md:hover:border-white md:duration-300',
            isDayOverFight && 'bg-stone-100 border-stone-300',
            isFightToday && 'border-red-300 bg-red-50',
            !isDayOverFight && !isFightToday && 'border-stone-400'
          )}
        >
          <div className="w-[300px]">
            <BoxerInfo
              boxer={matchData.red_boxer}
              matchResult={matchData.result}
              boxerColor="red"
            />
          </div>

          <MatchInfo matchData={matchData} />

          <div className="w-[300px]">
            <BoxerInfo
              boxer={matchData.blue_boxer}
              matchResult={matchData.result}
              boxerColor="blue"
            />
          </div>
          {isShowPredictionIcon && <PredictionVoteIcon />}
        </div>
      )}
    </>
  );
};
