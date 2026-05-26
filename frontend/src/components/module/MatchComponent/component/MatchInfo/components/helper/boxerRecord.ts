import type { BoxerType, MatchResultType } from '@/types';

export type BoxerResultState = 'win' | 'loss' | 'draw' | null;
export type BoxerSide = 'red' | 'blue';

export const getBoxerResultState = ({
  result,
  boxerSide,
}: {
  result: MatchResultType['result'] | false;
  boxerSide: BoxerSide;
}): BoxerResultState => {
  if (result === boxerSide) return 'win';
  if (result === 'draw') return 'draw';
  if (result && result !== 'no-contest') return 'loss';
  return null;
};

export const getDisplayedBoxerRecord = ({
  boxer,
  resultState,
  isKo,
}: {
  boxer: Pick<BoxerType, 'win' | 'ko' | 'draw' | 'lose'>;
  resultState: BoxerResultState;
  isKo: boolean;
}) => {
  return {
    win: resultState === 'win' ? boxer.win + 1 : boxer.win,
    ko: resultState === 'win' && isKo ? boxer.ko + 1 : boxer.ko,
    draw: resultState === 'draw' ? boxer.draw + 1 : boxer.draw,
    lose: resultState === 'loss' ? boxer.lose + 1 : boxer.lose,
  };
};
