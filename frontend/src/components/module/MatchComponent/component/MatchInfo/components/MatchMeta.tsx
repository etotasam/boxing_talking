import type { ReactNode } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { IoCalendarOutline } from 'react-icons/io5';
import { MdLocationPin } from 'react-icons/md';
import { MatchDataType } from '@/types';
import { FlagImage } from '@/components/atomic/FlagImage';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

export const MatchDate = ({ matchDate }: Pick<MatchDataType, 'matchDate'>) => {
  const date = dayjs(matchDate);
  const formattedDate = `${date.format('YYYY年M月D日')}（${WEEKDAYS[date.day()]}）`;

  return (
    <MatchMetaCard icon={<IoCalendarOutline aria-hidden="true" />} label="試合日時">
      <span>{formattedDate}</span>
      <span className="text-xs text-stone-300">日本時間</span>
    </MatchMetaCard>
  );
};

export const MatchVenue = ({
  country: placeCountry,
  venue,
}: Pick<MatchDataType, 'country' | 'venue'>) => {
  return (
    <MatchMetaCard icon={<MdLocationPin aria-hidden="true" />} label="試合会場">
      <span className="inline-flex min-w-0 items-center justify-center gap-2">
        <FlagImage className="h-[18px] w-[24px] shrink-0 border-[1px]" nationality={placeCountry} />
        <span className="min-w-0 truncate">{venue}</span>
      </span>
    </MatchMetaCard>
  );
};

type MatchMetaCardProps = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
};

const MatchMetaCard = ({ icon, label, children }: MatchMetaCardProps) => {
  return (
    <section
      className={clsx(
        'flex min-w-0 items-center gap-3 rounded-lg border border-stone-600/80',
        'bg-stone-950/80 px-4 py-3 text-white shadow-lg shadow-black/20'
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-bold text-stone-300">{label}</p>
        <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold leading-tight text-stone-50 sm:text-base">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center text-2xl text-stone-100">
            {icon}
          </span>
          {children}
        </p>
      </div>
    </section>
  );
};
