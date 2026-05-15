import { RotatingLines } from 'react-loader-spinner';
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
  const userPredictionLabel =
    userPrediction === undefined
      ? '取得中'
      : userPrediction === false
      ? '未投票'
      : userPrediction === 'red'
      ? `${redBoxerName} 勝利`
      : `${blueBoxerName} 勝利`;
  const canOpenPredictionModal = isShowVoteButton && showPredictionModal;
  const shouldShowUserPrediction = userPrediction !== false || Boolean(canOpenPredictionModal);
  const shouldShowVoteButton = userPrediction === false && Boolean(canOpenPredictionModal);

  return (
    <section
      className="mt-4 w-[88%] max-w-[820px] rounded-xl border border-stone-700 bg-stone-900/90 p-4 text-white"
      aria-label="prediction-summary"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs tracking-widest text-stone-400">PREDICTION</p>
          <h3 className="mt-1 text-base font-bold">勝敗予想サマリー</h3>
        </div>
        {shouldShowUserPrediction && (
          <div className="flex items-center gap-2 rounded-full bg-stone-800 px-3 py-1 text-sm">
            <span>あなたの予想:</span>
            {shouldShowVoteButton ? (
              <button
                type="button"
                className="rounded-md bg-yellow-400 px-3 py-1 text-xs font-bold text-stone-900 duration-300 hover:bg-yellow-300"
                onClick={showPredictionModal}
              >
                投票する
              </button>
            ) : (
              <span className="font-bold">{userPredictionLabel}</span>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 flex items-center justify-center gap-3 rounded-lg bg-stone-800/70 px-3 py-4 text-sm text-stone-200">
          <RotatingLines strokeColor="#f5f5f5" strokeWidth="3" animationDuration="1" width="24" />
          <span>勝敗予想を読み込み中...</span>
        </div>
      ) : matchPredictions ? (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-stone-400">
            <span>全体投票</span>
            <span>合計 {matchPredictions.totalVotes}票</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-stone-800">
            <div className="flex h-full">
              <div
                className="h-full bg-red-500"
                style={{
                  width:
                    matchPredictions.totalVotes === 0
                      ? '50%'
                      : `${(matchPredictions.red / matchPredictions.totalVotes) * 100}%`,
                }}
              />
              <div
                className="h-full bg-blue-500"
                style={{
                  width:
                    matchPredictions.totalVotes === 0
                      ? '50%'
                      : `${(matchPredictions.blue / matchPredictions.totalVotes) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-red-200">
              <p className="text-xs text-red-300">{redBoxerName}</p>
              <p className="mt-1 font-bold">{matchPredictions.red}票</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-blue-200">
              <p className="text-xs text-blue-300">{blueBoxerName}</p>
              <p className="mt-1 font-bold">{matchPredictions.blue}票</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-stone-400">全体投票は取得中です。</p>
      )}
    </section>
  );
};
