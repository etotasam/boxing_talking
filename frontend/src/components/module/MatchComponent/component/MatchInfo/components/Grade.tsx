import clsx from 'clsx';
import { GiImperialCrown } from 'react-icons/gi';
import { MatchDataType } from '@/types';

export const Grade = ({ matchData }: { matchData: MatchDataType }) => {
  const isTitleMatch = matchData.grade === 'タイトルマッチ';
  const titleOrganizations = matchData.titles.map(({ organization }) => organization);
  const shouldShowTitleBadges = isTitleMatch && titleOrganizations.length > 0;

  return (
    <section className="flex w-full justify-center pt-4 text-white" aria-label="match-grade">
      <div className="min-w-0 text-center">
        <p
          className={clsx(
            'inline-flex items-center justify-center gap-1 break-words text-[clamp(16px,3vw,24px)] font-black leading-tight',
            isTitleMatch ? 'text-yellow-200' : 'text-white'
          )}
        >
          {isTitleMatch && (
            <GiImperialCrown className="h-[0.9em] w-[0.9em] shrink-0" aria-hidden="true" />
          )}
          {matchData.weight}級
          {isTitleMatch && (
            <GiImperialCrown className="h-[0.9em] w-[0.9em] shrink-0" aria-hidden="true" />
          )}
        </p>
        {shouldShowTitleBadges ? (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {titleOrganizations.map((organization, index) => (
              <span
                key={`${organization}-${index}`}
                className="relative isolate overflow-hidden rounded-md border-2 border-yellow-400/70 bg-zinc-950/70 px-3 py-1 text-[clamp(13px,2.2vw,18px)] font-black leading-none text-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.26),inset_0_0_14px_rgba(250,204,21,0.12)] backdrop-blur-sm"
              >
                <span
                  className="absolute inset-x-2 top-[-10px] h-5 rounded-full bg-yellow-300/25 blur-md"
                  aria-hidden="true"
                />
                <span className="relative tracking-wide">{organization}</span>
              </span>
            ))}
          </div>
        ) : (
          <p
            className={clsx(
              'mt-1 break-words text-[clamp(16px,3vw,24px)] font-black leading-tight',
              isTitleMatch ? 'text-yellow-300' : 'text-white'
            )}
          >
            {matchData.grade}
          </p>
        )}
      </div>
    </section>
  );
};
