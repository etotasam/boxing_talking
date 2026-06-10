import clsx from 'clsx';
import { GiImperialCrown } from 'react-icons/gi';
import { MatchDataType } from '@/types';

export const Grade = ({ matchData }: { matchData: MatchDataType }) => {
  const isTitleMatch = matchData.grade === 'タイトルマッチ';
  const titleOrganizations = matchData.titles.map(({ organization }) => organization).join(' / ');
  const gradeLabel = isTitleMatch && titleOrganizations ? titleOrganizations : matchData.grade;

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
        <p
          className={clsx(
            'mt-1 break-words text-[clamp(16px,3vw,24px)] font-black leading-tight',
            isTitleMatch ? 'text-yellow-300' : 'text-white'
          )}
        >
          {gradeLabel}
        </p>
      </div>
    </section>
  );
};
