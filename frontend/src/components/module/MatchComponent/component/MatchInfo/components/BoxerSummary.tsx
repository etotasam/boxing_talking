import clsx from 'clsx';
import { COUNTRY_LABELS } from '@/constants/countryLabels';
import { FlagImage } from '@/components/atomic/FlagImage';
import type { BoxerType, MatchResultType } from '@/types';
import type { BoxerSide } from './helper/boxerRecord';
import { getBoxerResultState, getDisplayedBoxerRecord } from './helper/boxerRecord';

type BoxerSummaryProps = {
  boxer: BoxerType;
  side: BoxerSide;
  matchResult?: MatchResultType | null;
};

const formatRecord = ({ win, ko, lose, draw }: ReturnType<typeof getDisplayedBoxerRecord>) => {
  return `${win}勝（${ko}KO） ${lose}敗 ${draw}分`;
};

export const BoxerSummary = ({ boxer, side, matchResult = null }: BoxerSummaryProps) => {
  const result = matchResult?.result ?? false;
  const isKo = matchResult?.detail
    ? matchResult.detail === 'ko' || matchResult.detail === 'tko'
    : false;
  const resultState = getBoxerResultState({ result, boxerSide: side });
  const displayedRecord = getDisplayedBoxerRecord({ boxer, resultState, isKo });
  const recordLabel = formatRecord(displayedRecord);
  const isRedSide = side === 'red';

  return (
    <article
      className={clsx(
        'flex min-w-0 flex-col justify-center py-5 text-white',
        isRedSide
          ? 'items-start border-l-4 border-red-500 pl-3 pr-7 text-left pc:pl-7 pc:pr-16'
          : 'items-end border-r-4 border-blue-500 pl-7 pr-3 text-right pc:pl-16 pc:pr-7'
      )}
    >
      <h2
        className="max-w-full whitespace-nowrap text-[clamp(12px,4vw,30px)] font-black leading-tight pc:break-words pc:text-3xl"
        title={boxer.name}
        aria-label={boxer.name}
      >
        {boxer.name}
      </h2>
      <p
        className={clsx(
          'mt-1 max-w-full whitespace-nowrap text-[clamp(10px,3vw,18px)] font-bold leading-tight',
          'pc:mt-2 pc:break-words pc:text-base',
          isRedSide ? 'text-red-300' : 'text-blue-300'
        )}
        title={recordLabel}
      >
        {recordLabel}
      </p>
      <span
        className={clsx(
          'mt-3 inline-flex max-w-full items-center gap-1.5 rounded border border-stone-600',
          'bg-stone-900/90 px-2 py-1 text-[clamp(10px,3vw,12px)] font-bold text-stone-100',
          !isRedSide && 'flex-row-reverse'
        )}
      >
        <FlagImage
          className="h-[14px] w-[20px] shrink-0 overflow-hidden border border-stone-700"
          nationality={boxer.country}
        />
        <span className="min-w-0 whitespace-nowrap">{COUNTRY_LABELS[boxer.country]}</span>
      </span>
    </article>
  );
};
