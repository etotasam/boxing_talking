import clsx from 'clsx';
import { GiImperialCrown } from 'react-icons/gi';
import { MatchDataType } from '@/types';

export const Grade = ({ matchData }: { matchData: MatchDataType }) => {
  const isTitleMatch = matchData.grade === 'タイトルマッチ';
  const titleOrganizations = matchData.titles.map(({ organization }) => organization).join(' / ');

  return (
    <section className="flex w-full justify-center pt-4 text-white" aria-label="match-grade">
      <div
        className={clsx(
          'flex w-full items-center justify-center rounded-lg border px-4 py-3 shadow-lg shadow-black/20',
          isTitleMatch
            ? 'border-yellow-500/40 bg-yellow-500/10'
            : 'border-stone-700 bg-stone-950/95'
        )}
      >
        <div className="flex min-w-0 items-center">
          <div className="min-w-0 text-center">
            <p
              className={clsx(
                'text-xs font-bold tracking-wide',
                isTitleMatch ? 'text-yellow-100' : 'text-stone-400'
              )}
            >
              {matchData.weight}級
            </p>
            {isTitleMatch && titleOrganizations && (
              <p className="mt-1 break-words text-sm font-bold leading-tight text-yellow-200 sm:text-base">
                {titleOrganizations}
              </p>
            )}
            <p
              className={clsx(
                'mt-1 flex items-center justify-center gap-1 break-words text-lg font-black leading-tight sm:text-xl',
                isTitleMatch ? 'text-yellow-300' : 'text-stone-100'
              )}
            >
              {isTitleMatch && <GiImperialCrown className="h-5 w-5 shrink-0" aria-hidden="true" />}
              {matchData.grade}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
