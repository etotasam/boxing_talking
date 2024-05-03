import clsx from 'clsx';
import { MatchDataType } from '@/assets/types';
import { upperCase } from 'lodash';

type PropsType = {
  matchData: MatchDataType;
};
export const MatchResultBox = (props: PropsType) => {
  const { matchData } = props;
  const result = matchData.result!;

  const isWinner = result.result === 'red' || result.result === 'blue' ? result.result : false;
  const isDraw = result.result === 'draw';
  const isInValidMatch = result.result === 'no-contest';
  const isKo = result.detail === 'ko' || result.detail === 'tko';

  const unanimous = result.result === 'red' ? '3 - 0' : '0 - 3';
  const majority = result.result === 'red' ? '2 - 0' : '0 - 2';
  const split = result.result === 'red' ? '2 - 1' : '1 - 2';

  const resultText = isDraw
    ? '引き分け'
    : isInValidMatch
    ? '無効試合'
    : isKo
    ? `${result.round}R ${upperCase(result.detail)}`
    : result.detail === 'ud'
    ? unanimous
    : result.detail === 'md'
    ? majority
    : result.detail === 'sd' && split;

  return (
    <>
      <div className="text-white mt-3 py-2 bg-stone-800">
        <p className="text-center tracking-[0.5em] text-[1.2em] text-yellow-500">試合結果</p>
        <div className="flex items-center h-[50px]">
          <div
            className={clsx(
              'flex-1 text-center',
              isWinner === 'red' ? 'text-yellow-500' : 'text-stone-400'
            )}
          >
            {matchData.redBoxer.name}
          </div>
          <div className="text-center px-2">
            <span className="bg-green-600 px-2 pb-[2px] rounded-sm">{resultText}</span>
          </div>
          <div
            className={clsx(
              'flex-1 text-center',
              isWinner === 'blue' ? 'text-yellow-500' : 'text-stone-400'
            )}
          >
            {matchData.blueBoxer.name}
          </div>
        </div>
        {/* <p>{resultText}</p> */}
        {/* {isWinner && <span>{winner}</span>} */}
      </div>
    </>
  );
};
