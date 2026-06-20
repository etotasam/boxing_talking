import { RotatingLines } from 'react-loader-spinner';
import { MdHowToVote } from 'react-icons/md';
import { HiUserGroup } from 'react-icons/hi';
import { PiSealCheckFill } from 'react-icons/pi';
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

type UserPredictionStatusProps =
  | {
      type: 'hidden';
    }
  | {
      type: 'voted';
    }
  | {
      type: 'votable';
      onVoteClick: () => void;
    };

type PredictionStatsProps = {
  matchPredictions: MatchPredictionsType;
  userPrediction?: 'red' | 'blue' | false;
};

export const PredictionSummary = ({
  userPrediction,
  matchPredictions,
  isLoading,
  isShowVoteButton = false,
  showPredictionModal,
}: PredictionSummaryProps) => {
  const canOpenPredictionModal = isShowVoteButton && showPredictionModal;
  const userPredictionStatus = getUserPredictionStatus({
    userPrediction,
    showPredictionModal: canOpenPredictionModal ? showPredictionModal : undefined,
  });

  return (
    <section
      className="mt-4 w-full rounded-lg border border-stone-700 bg-stone-950/95 p-3 text-white shadow-lg shadow-black/20 sm:p-4"
      aria-label="prediction-summary"
    >
      {isLoading ? (
        <PredictionSummaryLoading />
      ) : matchPredictions ? (
        <PredictionStats matchPredictions={matchPredictions} userPrediction={userPrediction} />
      ) : (
        <PredictionSummaryEmpty />
      )}
      <UserPredictionStatus {...userPredictionStatus} />
    </section>
  );
};

const getUserPredictionStatus = ({
  userPrediction,
  showPredictionModal,
}: {
  userPrediction?: 'red' | 'blue' | false;
  showPredictionModal?: () => void;
}): UserPredictionStatusProps => {
  if (userPrediction === 'red' || userPrediction === 'blue') {
    return {
      type: 'voted',
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
      取得中
    </p>
  );
};

const PredictionStats = ({ matchPredictions, userPrediction }: PredictionStatsProps) => {
  const totalVotes = matchPredictions.totalVotes;
  const redVotes = matchPredictions.red;
  const blueVotes = matchPredictions.blue;
  const redPercent = totalVotes === 0 ? 0 : Math.round((redVotes / totalVotes) * 100);
  const bluePercent = totalVotes === 0 ? 0 : 100 - redPercent;
  const redBarWidth = totalVotes === 0 ? 50 : redPercent;
  const blueBarWidth = totalVotes === 0 ? 50 : bluePercent;

  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-center gap-1 text-xl font-bold text-stone-300"
        aria-label={`合計 ${totalVotes}票`}
      >
        <HiUserGroup aria-hidden="true" />
        {totalVotes}
      </div>

      <div className="grid grid-cols-1 items-center gap-3 pc:grid-cols-2">
        <div
          className={`min-w-0 rounded-md border px-3 py-2 ${
            userPrediction === 'red'
              ? 'border-red-400/80 bg-red-500/20 shadow-sm shadow-red-500/20'
              : 'border-red-500/20 bg-red-500/10'
          }`}
          aria-label="赤コーナーの投票結果"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black leading-none text-red-300">{redPercent}%</span>
              <span className="pb-0.5 text-xs font-bold text-red-200/80">{redVotes}票</span>
            </div>
            {userPrediction === 'red' && <UserPredictionBadge />}
          </div>
        </div>

        <div
          className={`min-w-0 rounded-md border px-3 py-2 text-right ${
            userPrediction === 'blue'
              ? 'border-blue-400/80 bg-blue-500/20 shadow-sm shadow-blue-500/20'
              : 'border-blue-500/20 bg-blue-500/10'
          }`}
          aria-label="青コーナーの投票結果"
        >
          <div className="flex items-center justify-between gap-3">
            {userPrediction === 'blue' && <UserPredictionBadge />}
            <div className="ml-auto flex items-end justify-end gap-2">
              <span className="pb-0.5 text-xs font-bold text-blue-200/80">{blueVotes}票</span>
              <span className="text-2xl font-black leading-none text-blue-300">{bluePercent}%</span>
            </div>
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
  );
};

const UserPredictionStatus = (props: UserPredictionStatusProps) => {
  if (props.type === 'hidden') {
    return null;
  }

  return (
    <div className="mt-3 flex justify-center">
      {props.type === 'votable' ? (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-sm text-stone-950 shadow-md shadow-black/30 duration-300 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-stone-950"
          onClick={props.onVoteClick}
        >
          <span className="relative inline-flex shrink-0">
            <MdHowToVote className="text-xl" aria-hidden="true" />
          </span>
          投票する
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-stone-500 bg-stone-600 px-4 py-2 text-sm text-stone-500 shadow-md shadow-black/20"
          disabled
        >
          <span className="relative inline-flex shrink-0">
            <MdHowToVote className="text-xl" aria-hidden="true" />
            <VotedBadge />
          </span>
          投票済み
        </button>
      )}
    </div>
  );
};

const UserPredictionBadge = () => {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-yellow-300">
      <PiSealCheckFill className="h-5 w-5" aria-hidden="true" />
      あなたの投票
    </span>
  );
};

const VotedBadge = () => {
  return (
    <PiSealCheckFill className="absolute -left-8 -top-4 h-8 w-8 rotate-[-12deg] place-items-center text-yellow-300" />
  );
};
