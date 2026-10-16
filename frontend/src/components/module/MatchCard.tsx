import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import clsx from 'clsx';
import { useRecoilValue } from 'recoil';
import { MdLocationPin } from 'react-icons/md';
import { MatchDataType } from '@/types';
import { BoxerType } from '@/types';
import { FlagImage } from '@/components/atomic/FlagImage';
import { useVoteIconState } from '@/hooks/useVoteIconState';
import { isPcState } from '@/store/isPcState';

dayjs.extend(utc);
dayjs.extend(timezone);

type PropsType = {
  matchData: MatchDataType;
  onClick: (matchId: number) => void;
  className?: string;
};

export const MatchCard = ({ matchData, onClick, className }: PropsType) => {
  const isShowVoteIcon = useVoteIconState({ matchDate: matchData.matchDate, id: matchData.id });
  const venue = matchData.venue.trim();

  return (
    <button
      type="button"
      onClick={() => onClick(matchData.id)}
      className={clsx(
        'relative flex w-full flex-col overflow-hidden border border-[#D99A2B]/60 bg-[#1B1D20] text-left text-[#F5F2E9]',
        'cursor-pointer transition-colors pc:hover:border-[#D99A2B] pc:hover:bg-[#24262A]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D99A2B] focus-visible:outline-offset-2',
        className
      )}
    >
      <span className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-2 px-3 pb-4 pt-3 pc:gap-x-6 pc:px-6">
        <BoxerBox boxer={matchData.redBoxer} side="red" />

        <span className="flex min-w-[30px] flex-col items-center justify-center self-stretch">
          {matchData.titles.length > 0 && (
            <span
              aria-label={`${matchData.titles.length}団体タイトル戦`}
              role="img"
              className="flex items-center justify-center gap-0.5 whitespace-nowrap text-[14px] leading-none text-[#D99A2B] pc:text-[16px]"
            >
              {matchData.titles.map((title, index) => (
                <span key={`${title.organization}-${index}`} aria-hidden="true">
                  ★
                </span>
              ))}
            </span>
          )}
          <span className="font-['Bebas_Neue'] text-2xl leading-none tracking-wide text-[#D99A2B] pc:text-3xl">
            VS
          </span>
          {isShowVoteIcon && <UnvotedBadge />}
        </span>

        <BoxerBox boxer={matchData.blueBoxer} side="blue" />
      </span>

      <MatchMetadata matchData={matchData} venue={venue} />
    </button>
  );
};

type BoxerBoxProps = {
  boxer: BoxerType;
  side: 'red' | 'blue';
};

const BoxerBox = ({ boxer, side }: BoxerBoxProps) => {
  const isRed = side === 'red';

  return (
    <span className={clsx('min-w-0 py-1', isRed ? 'text-left' : 'text-right')}>
      <span className={clsx('flex min-w-0 flex-col gap-1', isRed ? 'items-start' : 'items-end')}>
        <FlagImage
          nationality={boxer.country}
          className="inline-block h-5 w-8 shrink-0 pc:h-6 pc:w-9"
        />
        <span
          className={clsx(
            'max-w-full break-words font-["M_PLUS_1p"] text-[clamp(14px,2.8vw,24px)] font-bold leading-tight text-[#F5F2E9]',
            isRed ? 'text-left' : 'text-right'
          )}
        >
          {boxer.name}
        </span>
      </span>
    </span>
  );
};

type MatchMetadataProps = {
  matchData: MatchDataType;
  venue: string;
};

const MatchMetadata = (props: MatchMetadataProps) => {
  const isPc = useRecoilValue(isPcState);

  return (
    <span className="border-t border-[#AAA8A1]/40 px-3 py-2 pc:px-6">
      {isPc ? <DesktopMatchMetadata {...props} /> : <MobileMatchMetadata {...props} />}
    </span>
  );
};

const DesktopMatchMetadata = ({ matchData, venue }: MatchMetadataProps) => (
  <span
    className={clsx(
      'grid min-w-0 items-center gap-0 text-sm text-[#AAA8A1]',
      venue ? 'grid-cols-3' : 'grid-cols-2'
    )}
  >
    <MatchDate matchDate={matchData.matchDate} />
    <span className="border-l border-[#AAA8A1]/40 text-center">{matchData.weight}級</span>
    {venue && <VenueContent venue={venue} className="border-l border-[#AAA8A1]/40" />}
  </span>
);

const MobileMatchMetadata = ({ matchData, venue }: MatchMetadataProps) => (
  <span>
    <span className="grid min-w-0 grid-cols-2 items-center text-sm text-[#AAA8A1]">
      <MatchDate matchDate={matchData.matchDate} />
      <span className="border-l border-[#AAA8A1]/40 text-center">{matchData.weight}級</span>
    </span>
    {venue && <VenueContent venue={venue} className="mt-2 border-t border-[#AAA8A1]/40 pt-2" />}
  </span>
);

type MatchDateProps = {
  matchDate: MatchDataType['matchDate'];
};

const MatchDate = ({ matchDate: rawMatchDate }: MatchDateProps) => {
  const matchDate = dayjs.tz(rawMatchDate, 'Asia/Tokyo');
  const formattedDate = matchDate.format('YYYY.MM.DD ddd').toUpperCase();
  const dateTime = matchDate.format('YYYY-MM-DD');
  const today = dayjs().tz('Asia/Tokyo').startOf('day');
  const isMatchTodayOrTomorrow =
    today.isSame(matchDate, 'day') || today.isSame(matchDate.subtract(1, 'day'), 'day');
  const dateClassName = clsx(
    "flex items-center justify-center gap-1.5 font-['Bebas_Neue'] tracking-[0.08em] text-center",
    isMatchTodayOrTomorrow ? 'text-[#D99A2B]' : 'text-[#F5F2E9]'
  );

  return (
    <time dateTime={dateTime} className={dateClassName}>
      {formattedDate}
    </time>
  );
};

const UnvotedBadge = () => (
  <span
    className="mt-2 whitespace-nowrap rounded-full border border-[#D99A2B]/70 px-1.5 py-1 text-[10px] font-bold leading-none text-[#D99A2B] pc:mt-3 pc:px-3 pc:text-xs"
  >
    勝敗予想受付中
  </span>
);

const VenueContent = ({ venue, className }: { venue: string; className?: string }) => (
  <span
    className={clsx(
      'flex min-w-0 items-center justify-center gap-1 text-center text-[#AAA8A1]',
      className
    )}
  >
    <MdLocationPin aria-hidden="true" className="shrink-0 text-[#D99A2B]" />
    <span className="min-w-0 break-words">{venue}</span>
  </span>
);
