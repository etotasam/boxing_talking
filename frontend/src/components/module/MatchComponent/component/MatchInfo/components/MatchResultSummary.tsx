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
    return result.result === 'red'
      ? RED_WIN_DECISION_LABELS[result.detail]
      : BLUE_WIN_DECISION_LABELS[result.detail];
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
        'grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 px-3 pt-4',
        'text-[clamp(13px,3.5vw,22px)] font-black leading-none',
        'pc:px-7 pc:text-2xl'
      )}
      aria-label="match-result-summary"
    >
      <span className={clsx('text-left', isRedWinner ? 'text-yellow-300' : 'text-stone-300')}>
        {shouldShowSideResults && (isRedWinner ? 'WIN' : 'LOSE')}
      </span>
      <span className="text-center tracking-wide text-white">{resultLabel}</span>
      <span className={clsx('text-right', isBlueWinner ? 'text-yellow-300' : 'text-stone-300')}>
        {shouldShowSideResults && (isBlueWinner ? 'WIN' : 'LOSE')}
      </span>
    </div>
  );
};
