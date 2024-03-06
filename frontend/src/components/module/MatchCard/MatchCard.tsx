import clsx from 'clsx';
// ! types
import { MatchDataType } from '@/assets/types';
// ! components
import { BoxerInfo } from '../BoxerInfo';
import { PredictionIcon } from '@/components/atomic/PredictionIcon';
import { MatchInfo } from '../MatchInfo';

type PropsType = {
  matchData: MatchDataType;
  onClick: (matchId: number) => void;
  className?: string;
};

export const MatchCard = ({ matchData, onClick }: PropsType) => {
  return (
    <>
      {matchData && (
        <div
          onClick={() => onClick(matchData.id)}
          className={clsx(
            'text-stone-700 relative flex justify-between w-full max-w-[1024px] cursor-pointer rounded-lg duration-300 hover:bg-stone-100 bg-white/70',
            ' box-border border-[2px] border-transparent hover:border-gray-500'
          )}
        >
          <div className="w-[300px]">
            <BoxerInfo boxer={{ ...matchData.redBoxer, color: 'red' }} matchResult={matchData.result} />
          </div>

          <div className={clsx('pb-7', matchData.titles.length ? 'pt-10' : 'pt-7')}>
            <MatchInfo matchData={matchData} />
          </div>

          <div className="w-[300px]">
            <BoxerInfo boxer={{ ...matchData.blueBoxer, color: 'blue' }} matchResult={matchData.result} />
          </div>
          <PredictionIcon matchData={matchData} />
        </div>
      )}
    </>
  );
};
