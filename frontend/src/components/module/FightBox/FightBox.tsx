import clsx from 'clsx';
// ! types
import { MatchDataType } from '@/assets/types';
// ! components
import { BoxerInfo } from '../BoxerInfo';
import { PredictionIcon } from '@/components/atomic/PredictionIcon';
import { MatchInfo } from '../MatchInfo';
//! hook
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';

type PropsType = {
  matchData: MatchDataType;
  onClick: (matchId: number) => void;
  className?: string;
};

export const FightBox = ({ matchData, onClick }: PropsType) => {
  const { isFightToday, isDayOverFight } = useDayOfFightChecker(matchData);
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
              boxer={{ ...matchData.red_boxer, color: 'red' }}
              matchResult={matchData.result}
            />
          </div>

          <MatchInfo matchData={matchData} />

          <div className="w-[300px]">
            <BoxerInfo
              boxer={{ ...matchData.blue_boxer, color: 'blue' }}
              matchResult={matchData.result}
            />
          </div>
          <PredictionIcon matchData={matchData} />
        </div>
      )}
    </>
  );
};
