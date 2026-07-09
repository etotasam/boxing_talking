import { RotatingLines } from 'react-loader-spinner';
import { MdHowToVote } from 'react-icons/md';
import { HiUserGroup } from 'react-icons/hi';
import { IoIosLock } from 'react-icons/io';
import { PiSealCheckFill } from 'react-icons/pi';
import { MatchPredictionsType } from '@/types';
import clsx from 'clsx';

type PredictionSummaryProps = {
  userPrediction?: 'red' | 'blue' | false;
  matchPredictions?: MatchPredictionsType;
  isLoading: boolean;
  isShowVoteButton?: boolean;
  showPredictionModal?: () => void;
};

type PredictionActionButtonProps =
  | {
      type: 'hidden';
    }
  | {
      type: 'votable';
      onVoteClick: () => void;
    };

type PredictionStatsProps = {
  matchPredictions: Extract<MatchPredictionsType, { isVisible: true }>;
  userPrediction?: 'red' | 'blue' | false;
};

type PredictionSummaryContentProps = Pick<
  PredictionSummaryProps,
  'userPrediction' | 'matchPredictions' | 'isLoading'
> & {
  predictionActionButton: PredictionActionButtonProps;
};

export const PredictionSummary = ({
  userPrediction,
  matchPredictions,
  isLoading,
  isShowVoteButton = false,
  showPredictionModal,
}: PredictionSummaryProps) => {
  const canOpenPredictionModal = isShowVoteButton && showPredictionModal;
  const predictionActionButton = getPredictionActionButtonProps({
    userPrediction,
    showPredictionModal: canOpenPredictionModal ? showPredictionModal : undefined,
  });

  return (
    <section
      className="mt-4 w-full rounded-lg border border-stone-700 bg-stone-950/95 p-3 text-white shadow-lg shadow-black/20 sm:p-4"
      aria-label="prediction-summary"
    >
      <PredictionSummaryContent
        userPrediction={userPrediction}
        matchPredictions={matchPredictions}
        isLoading={isLoading}
        predictionActionButton={predictionActionButton}
      />
    </section>
  );
};

const PredictionSummaryContent = ({
  userPrediction,
  matchPredictions,
  isLoading,
  predictionActionButton,
}: PredictionSummaryContentProps) => {
  if (isLoading) {
    return <PredictionSummaryLoading />;
  }

  if (!matchPredictions) {
    return <PredictionSummaryEmpty />;
  }

  if (!matchPredictions.isVisible) {
    return <PredictionSummaryLocked predictionActionButton={predictionActionButton} />;
  }

  return <PredictionStats matchPredictions={matchPredictions} userPrediction={userPrediction} />;
};

const getPredictionActionButtonProps = ({
  userPrediction,
  showPredictionModal,
}: {
  userPrediction?: 'red' | 'blue' | false;
  showPredictionModal?: () => void;
}): PredictionActionButtonProps => {
  if (userPrediction === 'red' || userPrediction === 'blue') {
    return {
      type: 'hidden',
    };
  }

  if (userPrediction === false && showPredictionModal) {
    return {
      type: 'votable',
      onVoteClick: showPredictionModal,
    };
  }

  return {
    type: 'hidden',
  };
};

const PredictionSummaryLoading = () => {
  return (
    <div className="flex min-h-[112px] items-center justify-center gap-3 rounded-md bg-stone-900 px-3 py-4 text-sm text-stone-200">
      <RotatingLines strokeColor="#f5f5f5" strokeWidth="3" animationDuration="1" width="24" />
      <span>勝敗予想を読み込み中...</span>
    </div>
  );
};

const PredictionSummaryEmpty = () => {
  return (
    <p className="flex min-h-[112px] items-center justify-center rounded-md bg-stone-900 px-3 py-4 text-sm text-stone-400">
      勝敗予想を取得できませんでした
    </p>
  );
};

const PredictionSummaryLocked = ({
  predictionActionButton,
}: {
  predictionActionButton: PredictionActionButtonProps;
}) => {
  return (
    <div className="relative min-h-[132px] overflow-hidden rounded-md bg-stone-900 px-3 py-3 sm:min-h-[168px] sm:px-4 sm:py-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(239,68,68,0.14),transparent_42%,transparent_58%,rgba(59,130,246,0.14))] blur-lg sm:blur-xl"
      />
      <div className="relative flex min-h-[108px] flex-col items-center justify-center gap-3 text-center sm:min-h-[128px] sm:gap-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-500 bg-stone-950/60 text-stone-200">
          <IoIosLock className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <p className="text-base font-bold text-stone-100 sm:text-lg">
          投票すると予想を確認できます
        </p>
        <PredictionActionButton {...predictionActionButton} />
      </div>
    </div>
  );
};

const PredictionStats = ({ matchPredictions, userPrediction }: PredictionStatsProps) => {
  const totalVotes = matchPredictions.totalVotes;
  const redVotes = matchPredictions.red;
  const redPercent = totalVotes === 0 ? 0 : Math.round((redVotes / totalVotes) * 100);
  const bluePercent = totalVotes === 0 ? 0 : 100 - redPercent;
  const redBarWidth = totalVotes === 0 ? 50 : redPercent;
  const blueBarWidth = totalVotes === 0 ? 50 : bluePercent;

  return (
    <div className="grid grid-cols-2 items-stretch gap-x-4 gap-y-3 pc:grid-cols-[minmax(0,1fr)_minmax(240px,2fr)_minmax(0,1fr)] pc:items-center pc:gap-x-5">
      <div
        className={`col-start-1 row-start-1 min-w-0 rounded-md border px-3 py-7 ${
          userPrediction === 'red'
            ? 'border-red-400/80 bg-red-500/20 shadow-sm shadow-red-500/20'
            : 'border-red-500/20 bg-red-500/10'
        }`}
        aria-label="赤コーナーの投票結果"
      >
        <div className="relative flex h-full min-h-14 flex-col items-center justify-center gap-2 pc:min-h-16 pc:items-center">
          <span className="text-5xl font-black leading-none text-red-500 pc:text-6xl">
            {redPercent}
            <span className="text-2xl pc:text-3xl">%</span>
          </span>
          {userPrediction === 'red' && <UserPredictionBadge />}
        </div>
      </div>

      <div
        className={`col-start-2 row-start-1 min-w-0 rounded-md border px-3 py-7 text-right pc:col-start-3 ${
          userPrediction === 'blue'
            ? 'border-blue-400/80 bg-blue-500/20 shadow-sm shadow-blue-500/20'
            : 'border-blue-500/20 bg-blue-500/10'
        }`}
        aria-label="青コーナーの投票結果"
      >
        <div className="relative flex h-full min-h-14 flex-col items-center justify-center gap-2 pc:min-h-16 pc:items-center">
          <span className="text-5xl font-black leading-none text-blue-500 pc:text-6xl">
            {bluePercent}
            <span className="text-2xl pc:text-3xl">%</span>
          </span>
          {userPrediction === 'blue' && <UserPredictionBadge />}
        </div>
      </div>

      <div className="col-span-2 col-start-1 row-start-2 flex flex-col pc:col-span-1 pc:col-start-2 pc:row-start-1">
        <div className="order-1 h-4 overflow-hidden pc:order-2" aria-hidden="true">
          <div className="flex h-full">
            <div
              className={clsx(
                'h-full bg-red-600 rounded-full',
                redBarWidth !== 100 && redBarWidth !== 0 && 'mr-1'
              )}
              style={{
                width: `${redBarWidth}%`,
              }}
            />
            <div
              className={clsx(
                'h-full bg-blue-600 rounded-full',
                blueBarWidth !== 100 && blueBarWidth !== 0 && 'ml-1'
              )}
              style={{
                width: `${blueBarWidth}%`,
              }}
            />
          </div>
        </div>
        <div
          className="order-2 mt-2 flex items-center justify-center gap-1 text-sm font-bold text-stone-300 pc:order-1 pc:mb-2 pc:mt-0 pc:text-base"
          aria-label={`合計 ${totalVotes}票`}
        >
          <HiUserGroup aria-hidden="true" />
          {totalVotes}票
        </div>
      </div>
    </div>
  );
};

const PredictionActionButton = (props: PredictionActionButtonProps) => {
  if (props.type === 'hidden') {
    return null;
  }

  return (
    <button
      type="button"
      className="inline-flex min-h-11 w-auto items-center justify-center gap-2 rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-sm text-stone-950 shadow-md shadow-black/30 duration-300 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-stone-950"
      onClick={props.onVoteClick}
    >
      <span className="relative inline-flex shrink-0">
        <MdHowToVote className="text-xl" aria-hidden="true" />
      </span>
      勝者を予想する
    </button>
  );
};

const UserPredictionBadge = () => {
  return (
    <span className="absolute -top-4 left-1/2 inline-flex -translate-x-1/2 shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold text-yellow-300">
      <PiSealCheckFill className="h-5 w-5" aria-hidden="true" />
      あなたの投票
    </span>
  );
};
