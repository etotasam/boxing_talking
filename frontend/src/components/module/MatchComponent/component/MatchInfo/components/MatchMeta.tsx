import type { ReactNode } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { IoCalendarOutline } from 'react-icons/io5';
import { MdLocationPin } from 'react-icons/md';
import { MatchDataType } from '@/types';
import { FlagImage } from '@/components/atomic/FlagImage';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

const formatMatchDate = (matchDate: MatchDataType['matchDate']) => {
  const date = dayjs(matchDate);
  return `${date.format('YYYY年M月D日')}（${WEEKDAYS[date.day()]}）`;
};

export const MatchMeta = ({
  matchDate,
  country,
  venue,
}: Pick<MatchDataType, 'matchDate' | 'country' | 'venue'>) => {
  return (
    <section
      className={clsx(
        'mt-5 flex w-full flex-col rounded-lg border border-stone-600/80',
        'bg-stone-500/10 text-white shadow-lg shadow-black/20 pc:flex-row pc:items-center'
      )}
      aria-label="match-meta"
    >
      <MatchMetaColumn
        icon={<IoCalendarOutline aria-hidden="true" />}
        label="試合日時"
        className="px-4 pc:pl-7 pc:pr-6"
      >
        <MatchDateContent matchDate={matchDate} />
      </MatchMetaColumn>
      <div
        className="mx-4 h-px bg-stone-500/70 pc:mx-0 pc:h-12 pc:w-px pc:shrink-0"
        aria-hidden="true"
      />
      <MatchMetaColumn
        icon={<MdLocationPin aria-hidden="true" />}
        label="試合会場"
        className="px-4 pc:pl-6 pc:pr-7"
      >
        <MatchVenueContent country={country} venue={venue} />
      </MatchMetaColumn>
    </section>
  );
};

const MatchDateContent = ({ matchDate }: Pick<MatchDataType, 'matchDate'>) => {
  return (
    <>
      <span>{formatMatchDate(matchDate)}</span>
      <span className="text-xs text-stone-300">日本時間</span>
    </>
  );
};

const MatchVenueContent = ({ country, venue }: Pick<MatchDataType, 'country' | 'venue'>) => {
  return (
    <span className="inline-flex min-w-0 items-center justify-center gap-2">
      <FlagImage className="h-[18px] w-[24px] shrink-0 border-[1px]" nationality={country} />
      <span className="min-w-0 truncate">{venue}</span>
    </span>
  );
};

type MatchMetaColumnProps = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
};

const MatchMetaColumn = ({ icon, label, children, className }: MatchMetaColumnProps) => {
  return (
    <div
      aria-label={label}
      className={clsx(
        'flex min-w-0 flex-1 items-center justify-center gap-3 py-4 text-center',
        'pc:justify-start pc:gap-4 pc:text-left',
        className
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center text-3xl text-stone-100">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="hidden text-sm font-bold text-stone-300 pc:block">{label}</p>
        <p className="flex min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-base font-bold leading-tight text-stone-50 pc:mt-1 pc:justify-start">
          {children}
        </p>
      </div>
    </div>
  );
};
