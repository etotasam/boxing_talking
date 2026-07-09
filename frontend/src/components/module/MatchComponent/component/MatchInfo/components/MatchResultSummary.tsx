import clsx from 'clsx';
import type { MatchResultType } from '@/types';

const RESULT_DETAIL_LABELS: Record<NonNullable<MatchResultType['detail']>, string> = {
  ko: 'KO',
  tko: 'TKO',
  ud: 'UD',
  md: 'MD',
  sd: 'SD',
};

const RED_WIN_DECISION_LABELS: Record<'ud' | 'md' | 'sd', string> = {
  ud: '3-0',
  md: '2-0',
  sd: '2-1',
};

const BLUE_WIN_DECISION_LABELS: Record<'ud' | 'md' | 'sd', string> = {
  ud: '0-3',
  md: '0-2',
  sd: '1-2',
};

const getResultLabel = (result: MatchResultType) => {
  if (result.result === 'draw') return 'DRAW';
  if (result.result === 'no-contest') return 'NO CONTEST';

  if (result.detail === 'ud' || result.detail === 'md' || result.detail === 'sd') {
    const decisionLabel = result.result === 'red'
      ? RED_WIN_DECISION_LABELS[result.detail]
      : BLUE_WIN_DECISION_LABELS[result.detail];
    return `判定 ${decisionLabel}`;
  }

  const detailLabel = result.detail ? RESULT_DETAIL_LABELS[result.detail] : '';
  if (result.round && detailLabel) return `${result.round}R ${detailLabel}`;

  return detailLabel;
};

type MatchResultSummaryProps = {
  result: MatchResultType;
};

export const MatchResultSummary = ({ result }: MatchResultSummaryProps) => {
  const isRedWinner = result.result === 'red';
  const isBlueWinner = result.result === 'blue';
  const shouldShowSideResults = isRedWinner || isBlueWinner;
  const resultLabel = getResultLabel(result);

  return (
    <div
      className={clsx(
        'mx-3 mt-4 rounded-lg p-px pc:mx-7',
        isRedWinner &&
          'bg-gradient-to-r from-yellow-300 via-amber-400/70 to-stone-600 shadow-[0_0_16px_rgba(250,204,21,0.12)]',
        isBlueWinner &&
          'bg-gradient-to-r from-stone-600 via-amber-400/70 to-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.12)]',
        !shouldShowSideResults && 'bg-stone-600'
      )}
      aria-label="match-result-summary"
    >
      <div
        className={clsx(
          'grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 rounded-[7px] bg-stone-950/95',
          'px-3 py-3 text-[clamp(13px,3.5vw,22px)] font-black leading-none',
          'pc:px-7 pc:text-2xl'
        )}
      >
        <span className={clsx('text-left', isRedWinner ? 'text-yellow-300' : 'text-stone-400')}>
          {shouldShowSideResults && (isRedWinner ? 'WIN' : 'LOSE')}
        </span>
        <span className="text-center tracking-wide text-white">{resultLabel}</span>
        <span className={clsx('text-right', isBlueWinner ? 'text-yellow-300' : 'text-stone-400')}>
          {shouldShowSideResults && (isBlueWinner ? 'WIN' : 'LOSE')}
        </span>
      </div>
    </div>
  );
};
