import { useState } from 'react';
import { ClearFullScreenDiv } from '@/components/atomic/ClearFullScreenDiv';
import { FlagImage } from '@/components/atomic/FlagImage';
import { RiCloseLine } from 'react-icons/ri';
import { IoCheckmark, IoLockClosed } from 'react-icons/io5';
import { MdHowToVote } from 'react-icons/md';
import { CountryType } from '@/types';
import clsx from 'clsx';

type CornerColor = 'red' | 'blue';

type BoxersDataType = {
  red: {
    name: string;
    country: CountryType;
  };
  blue: {
    name: string;
    country: CountryType;
  };
};

type PredictionVoteModalType = {
  boxersData: BoxersDataType;
  voteExecution: (color: 'red' | 'blue') => void;
  close: () => void;
};
export const PredictionVoteModal = ({
  boxersData,
  voteExecution,
  close,
}: PredictionVoteModalType) => {
  const [selectedColor, setSelectedColor] = useState<CornerColor | null>(null);

  const submitVote = () => {
    if (!selectedColor) return;

    voteExecution(selectedColor);
  };

  return (
    <ClearFullScreenDiv className="z-30 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prediction-vote-modal-title"
        className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl items-center justify-center overflow-y-auto rounded-xl border border-stone-700 bg-stone-950 p-5 text-white shadow-2xl shadow-black/60 pc:p-8"
      >
        <div className="w-full">
          <div className="flex items-center gap-3 pr-10">
            <MdHowToVote className="shrink-0 text-3xl text-yellow-400" aria-hidden="true" />
            <h2 id="prediction-vote-modal-title" className="text-xl font-bold pc:text-2xl">
              勝者を予想
            </h2>
          </div>

          <div className="mt-6 space-y-3 pc:mt-7 pc:space-y-4">
            <BoxerButton
              boxerData={boxersData.red}
              color="red"
              isSelected={selectedColor === 'red'}
              onClick={() => setSelectedColor('red')}
            />
            <BoxerButton
              boxerData={boxersData.blue}
              color="blue"
              isSelected={selectedColor === 'blue'}
              onClick={() => setSelectedColor('blue')}
            />
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-stone-400 pc:mt-6 pc:text-sm">
            <IoLockClosed aria-hidden="true" />
            投票後は変更できません
          </p>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              disabled={!selectedColor}
              onClick={submitVote}
              className="inline-flex min-h-11 w-full max-w-sm items-center justify-center rounded-lg border border-yellow-200 bg-yellow-400 px-5 py-2.5 text-sm font-bold text-stone-950 shadow-md shadow-black/30 duration-300 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-stone-950 disabled:cursor-not-allowed disabled:border-stone-700 disabled:bg-stone-800 disabled:text-stone-500 disabled:shadow-none"
            >
              この選手に投票する
            </button>
          </div>
        </div>

        <button
          type="button"
          aria-label="投票モーダルを閉じる"
          onClick={close}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-stone-300 duration-300 hover:bg-stone-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-300 pc:right-5 pc:top-5"
        >
          <RiCloseLine aria-hidden="true" />
        </button>
      </div>
    </ClearFullScreenDiv>
  );
};

type BoxerButtonType = {
  boxerData: { name: string; country: CountryType };
  color: CornerColor;
  isSelected: boolean;
  onClick: () => void;
};
const BoxerButton = ({ onClick, boxerData, color, isSelected }: BoxerButtonType) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={clsx(
        'flex min-h-20 w-full items-center gap-3 rounded-lg border bg-stone-900 px-4 py-4 text-left duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-950 pc:min-h-24 pc:gap-4 pc:px-5',
        color === 'red'
          ? 'border-red-500/70 hover:bg-red-500/10 focus:ring-red-400'
          : 'border-blue-500/70 hover:bg-blue-500/10 focus:ring-blue-400',
        isSelected &&
          (color === 'red'
            ? 'bg-red-500/15 shadow-md shadow-red-950/40'
            : 'bg-blue-500/15 shadow-md shadow-blue-950/40')
      )}
    >
      <FlagImage
        className="h-7 w-9 shrink-0 overflow-hidden rounded-sm pc:h-8 pc:w-11"
        nationality={boxerData.country}
      />
      <span className="min-w-0 flex-1 break-words text-sm font-bold leading-relaxed pc:text-lg">
        {boxerData.name}
      </span>
      <span
        className={clsx(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xl',
          isSelected
            ? color === 'red'
              ? 'border-red-400 text-red-300'
              : 'border-blue-400 text-blue-300'
            : 'border-stone-500 text-transparent'
        )}
        aria-hidden="true"
      >
        {isSelected && <IoCheckmark />}
      </span>
    </button>
  );
};
