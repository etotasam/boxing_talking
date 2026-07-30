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
            'inline-flex items-center justify-center gap-1 break-words text-[clamp(18px,3vw,24px)] font-black leading-tight',
            isTitleMatch ? 'text-amber-300' : 'text-white'
          )}
        >
          {isTitleMatch && (
            <GiImperialCrown
              className="h-[0.9em] w-[0.9em] shrink-0 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.72)]"
              aria-hidden="true"
            />
          )}
          {isTitleMatch ? (
            <span className="bg-gradient-to-b from-yellow-50 via-amber-300 to-yellow-600 bg-clip-text text-transparent">
              {matchData.weight}級
            </span>
          ) : (
            `${matchData.weight}級`
          )}
          {isTitleMatch && (
            <GiImperialCrown
              className="h-[0.9em] w-[0.9em] shrink-0 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.72)]"
              aria-hidden="true"
            />
          )}
        </p>
        {shouldShowTitleBadges ? (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {titleOrganizations.map((organization, index) => (
              <span
                key={`${organization}-${index}`}
                className="relative isolate overflow-hidden rounded-md bg-gradient-to-br from-yellow-100 via-amber-400 to-yellow-700 p-[1.4px]"
              >
                <span className="relative block overflow-hidden rounded-[4px] bg-zinc-950/80 px-2 py-1 backdrop-blur-sm">
                  <span
                    className="absolute inset-x-2 top-[-10px] h-5 rounded-full"
                    aria-hidden="true"
                  />
                  <span className="relative bg-gradient-to-b from-yellow-50 via-amber-300 to-yellow-600 bg-clip-text text-[clamp(16px,2.2vw,18px)] font-black leading-none tracking-wide text-transparent">
                    {organization}
                  </span>
                </span>
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
