import { RotatingLines } from 'react-loader-spinner';
import { MdCheckCircle, MdHowToVote } from 'react-icons/md';
import { HiUserGroup } from 'react-icons/hi';
import { MatchPredictionsType } from '@/types';

type PredictionSummaryProps = {
  userPrediction?: 'red' | 'blue' | false;
  matchPredictions?: MatchPredictionsType;
  isLoading: boolean;
  redBoxerName: string;
  blueBoxerName: string;
  isShowVoteButton?: boolean;
  showPredictionModal?: () => void;
};

export const PredictionSummary = ({
  userPrediction,
  matchPredictions,
  isLoading,
  redBoxerName,
  blueBoxerName,
  isShowVoteButton = false,
  showPredictionModal,
}: PredictionSummaryProps) => {
  const totalVotes = matchPredictions?.totalVotes ?? 0;
  const redVotes = matchPredictions?.red ?? 0;
  const blueVotes = matchPredictions?.blue ?? 0;
  const redPercent = totalVotes === 0 ? 0 : Math.round((redVotes / totalVotes) * 100);
  const bluePercent = totalVotes === 0 ? 0 : 100 - redPercent;
  const redBarWidth = totalVotes === 0 ? 50 : redPercent;
  const blueBarWidth = totalVotes === 0 ? 50 : bluePercent;
  const userPredictionLabel =
    userPrediction === 'red' ? redBoxerName : userPrediction === 'blue' ? blueBoxerName : undefined;
  const canOpenPredictionModal = isShowVoteButton && showPredictionModal;
  const shouldShowUserPrediction =
    userPrediction === 'red' || userPrediction === 'blue' || Boolean(canOpenPredictionModal);
  const shouldShowVoteButton = userPrediction === false && Boolean(canOpenPredictionModal);
  const userPredictionStatus = shouldShowUserPrediction ? (
    <div className="mt-3 flex justify-center">
      {shouldShowVoteButton ? (
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-black text-stone-950 duration-300 hover:bg-yellow-300"
          onClick={showPredictionModal}
        >
          <MdHowToVote aria-hidden="true" />
          投票
        </button>
      ) : (
        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-stone-600 bg-stone-900 px-3 py-1 text-xs font-bold text-stone-100">
          <MdCheckCircle className="text-green-400" aria-hidden="true" />
          <span className="truncate">{userPredictionLabel}</span>
        </span>
      )}
    </div>
  ) : null;

  return (
    <section
      className="mt-4 w-[95%] max-w-[1024px] rounded-lg border border-stone-700 bg-stone-950/95 p-3 text-white shadow-lg shadow-black/20 sm:p-4"
      aria-label="prediction-summary"
    >
      {isLoading ? (
        <div className="flex min-h-[112px] items-center justify-center gap-3 rounded-md bg-stone-900 px-3 py-4 text-sm text-stone-200">
          <RotatingLines strokeColor="#f5f5f5" strokeWidth="3" animationDuration="1" width="24" />
          <span>勝敗予想を読み込み中...</span>
        </div>
      ) : matchPredictions ? (
        <div className="space-y-3">
          <div
            className="flex items-center justify-center gap-1 text-xl font-bold text-stone-300"
            aria-label={`合計 ${totalVotes}票`}
          >
            <HiUserGroup aria-hidden="true" />
            {totalVotes}
          </div>

          <div className="grid grid-cols-2 items-center gap-3">
            <div className="min-w-0 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black leading-none text-red-300">{redPercent}%</span>
                <span className="pb-0.5 text-xs font-bold text-red-200/80">{redVotes}票</span>
              </div>
            </div>

            <div className="min-w-0 rounded-md border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-right">
              <div className="flex items-end justify-end gap-2">
                <span className="pb-0.5 text-xs font-bold text-blue-200/80">{blueVotes}票</span>
                <span className="text-2xl font-black leading-none text-blue-300">
                  {bluePercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 overflow-hidden rounded-full bg-stone-800" aria-hidden="true">
            <div className="flex h-full">
              <div
                className="h-full bg-red-500"
                style={{
                  width: `${redBarWidth}%`,
                }}
              />
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${blueBarWidth}%`,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="flex min-h-[112px] items-center justify-center rounded-md bg-stone-900 px-3 py-4 text-sm text-stone-400">
          取得中
        </p>
      )}
      {userPredictionStatus}
    </section>
  );
};
