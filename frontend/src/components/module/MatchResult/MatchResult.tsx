import { useRef } from 'react';
import { MatchDataType } from '@/assets/types';
import clsx from 'clsx';
import { useWindowSize } from '@/hooks/useWindowSize';
//! type
import { MatchResultType } from '@/assets/types';

export const MatchResult = ({ matchData }: { matchData: MatchDataType }) => {
  const { result } = matchData;
  const matchResult = useRef<string | null>(null);
  const winner = useRef<string | null>(null);

  const { device } = useWindowSize();

  const isWinner: boolean =
    result?.result === 'red' || result?.result === 'blue';
  const isKo: boolean =
    isWinner && (result?.detail === 'ko' || result?.detail === 'tko');
  const isDecision: boolean =
    isWinner && result?.detail !== 'ko' && result?.detail !== 'tko';

  const createResultIcon = (): void => {
    if (!result) return;

    if (isWinner) {
      if (result.result === 'red') winner.current = matchData.red_boxer.name;
      if (result.result === 'blue') winner.current = matchData.blue_boxer.name;

      if (isKo) {
        if (result.detail === 'ko') matchResult.current = `${result.round}R KO`;
        if (result.detail === 'tko')
          matchResult.current = `${result.round}R TKO`;
        return;
      }
      if (isDecision) {
        if (result.detail === 'ud') matchResult.current = '3-0';
        if (result.detail === 'md') matchResult.current = '2-0';
        if (result.detail === 'sd') matchResult.current = '2-1';
        return;
      }
    }

    if (!isWinner) {
      winner.current = null;
      if (result.result === 'draw') matchResult.current = '引き分け';
      if (result.result === 'no-contest') matchResult.current = '無効試合';
    }
  };

  createResultIcon();

  const resultData = {
    isWinner,
    isKo,
    isDecision,
    result,
    winnerName: winner.current,
    matchResult: matchResult.current,
  };

  if (device === 'SP') return <SPType {...resultData} />;
  if (device === 'PC') return <PCType {...resultData} />;
};

type ResultDataType = {
  isWinner: boolean;
  isKo: boolean;
  isDecision: boolean;
  result: MatchResultType | null;
  winnerName: string | null;
  matchResult: string | null;
};
const SPType = (props: ResultDataType) => {
  const { isKo, isDecision, result, winnerName, matchResult } = props;
  return (
    <>
      {matchResult && (
        <div className="flex justify-center">
          <span
            className={clsx(
              'rounded-sm text-sm text-center text-white px-2 py-1 tracking-normal font-[550]',
              isKo && 'bg-green-600',
              isDecision && 'bg-sky-600',
              result?.result === 'draw' && 'bg-stone-600',
              result?.result === 'no-contest' && 'bg-black'
            )}
          >
            {matchResult}
          </span>
        </div>
      )}
      {winnerName && (
        <span
          className={clsx(
            'lg:text-[20px] sm:text-[16px] mt-1',
            winnerName.length > 7 ? `text-[12px]` : `text-[16px]`
          )}
        >
          {winnerName}
        </span>
      )}
    </>
  );
};

const PCType = (props: ResultDataType) => {
  const { isKo, isDecision, result, winnerName, matchResult } = props;
  return (
    <div className="flex mt-1">
      {matchResult && (
        <span
          className={clsx(
            'rounded-sm text-sm flex justify-center items-center text-white px-2 pb-[2px] mr-2 tracking-normal font-[550]',
            isKo && 'bg-green-600',
            isDecision && 'bg-sky-600',
            result?.result === 'draw' && 'bg-stone-600',
            result?.result === 'no-contest' && 'bg-black'
          )}
        >
          {matchResult}
        </span>
      )}
      {winnerName}
    </div>
  );
};
