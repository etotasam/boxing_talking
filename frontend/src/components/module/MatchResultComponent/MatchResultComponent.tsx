import React, { useRef } from 'react';
import { MatchDataType } from '@/assets/types';
import clsx from 'clsx';
import { useWindowSize } from '@/hooks/useWindowSize';

export const MatchResultComponent = ({
  matchData,
}: {
  matchData: MatchDataType;
}) => {
  const { result } = matchData;
  const matchResult = useRef<string | null>(null);
  const winner = useRef<string | null>(null);

  const { device } = useWindowSize();

  const isWinner = result?.result === 'red' || result?.result === 'blue';
  const isKo =
    isWinner && (result?.detail === 'ko' || result?.detail === 'tko');
  const isDecision =
    isWinner && result?.detail !== 'ko' && result?.detail !== 'tko';

  const createResultIcon = () => {
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

  const winnerName = winner.current;

  if (device === 'SP') {
    return (
      <>
        {matchResult.current && (
          <div className="flex justify-center">
            <span
              className={clsx(
                'rounded-sm text-sm text-center text-white px-3 py-1',
                isKo && 'bg-green-600',
                isDecision && 'bg-sky-600',
                result?.result === 'draw' && 'bg-stone-600',
                result?.result === 'no-contest' && 'bg-black'
              )}
            >
              {matchResult.current}
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
  }

  return (
    <div className="flex">
      {matchResult.current && (
        <span
          className={clsx(
            'rounded-sm text-sm flex justify-center items-center text-white px-3 py-1 mr-2',
            isKo && 'bg-green-600',
            isDecision && 'bg-sky-600',
            result?.result === 'draw' && 'bg-stone-600',
            result?.result === 'no-contest' && 'bg-black'
          )}
        >
          {matchResult.current}
        </span>
      )}
      {winner.current}
    </div>
  );
};
