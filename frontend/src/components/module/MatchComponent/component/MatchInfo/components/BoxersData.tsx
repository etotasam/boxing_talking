import clsx from 'clsx';
import type { MatchDataType } from '@/types';
import { BoxerSummary } from './BoxerSummary';
import { MatchResultSummary } from './MatchResultSummary';

type BoxersDataProps = {
  matchData: MatchDataType;
};

export const BoxersData = ({ matchData }: BoxersDataProps) => {
  return (
    <section
      className={clsx('relative mt-4 w-[95%] max-w-[1024px] text-white')}
      aria-label="boxers-summary"
    >
      <div className={clsx('relative overflow-hidden')}>
        {matchData.result && <MatchResultSummary result={matchData.result} />}
        <div className="relative">
          <div className="grid min-h-[130px] grid-cols-2 pc:min-h-[170px]">
            <BoxerSummary side="red" boxer={matchData.redBoxer} matchResult={matchData.result} />
            <BoxerSummary side="blue" boxer={matchData.blueBoxer} matchResult={matchData.result} />
          </div>
          <div
            className="absolute bottom-5 left-1/2 top-5 w-px -translate-x-1/2 bg-stone-500/70"
            aria-hidden="true"
          />
          <div
            className={clsx(
              'pointer-events-none absolute left-1/2 top-1/2 flex h-8 w-8',
              '-translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
              'border border-stone-500/80 bg-stone-950/95 text-sm font-black text-stone-50',
              'pc:h-12 pc:w-12 pc:text-xl'
            )}
          >
            VS
          </div>
        </div>
      </div>
    </section>
  );
};
