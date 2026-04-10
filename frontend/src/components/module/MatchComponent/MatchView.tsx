import clsx from 'clsx';
//! type
import { MatchDataType } from '@/types';
import { DeviceStateType } from '@/store/deviceState';
import { MatchPredictionsType } from '@/types';

//! component
import { MatchInfo } from './component/MatchInfo';
import { PostComment } from './component/PostComment';
import { PredictionVoteModal } from './component/PredictionVoteModal';
import { VoteIcon } from './component/VoteIcon';
import { MatchCommentsModal } from './component/MatchCommentsModal';

export type UsersPredictionType = 'red' | 'blue' | false | undefined;

export type MatchViewProps = {
  matchData: MatchDataType;
  userPrediction: UsersPredictionType;
  matchPredictions: MatchPredictionsType | undefined;
  device: DeviceStateType;
  isShowPredictionModal: boolean;
  showPredictionModal: () => void;
  isShowVoteIcon: boolean;
  isScroll: boolean;
  voteIconBottomPosition: number;
  commentsModalHeightHiddenState: number;
};

export const MatchView = ({
  matchData,
  userPrediction,
  matchPredictions,
  device,
  isShowPredictionModal,
  showPredictionModal,
  isShowVoteIcon,
  isScroll,
  voteIconBottomPosition,
  commentsModalHeightHiddenState,
}: MatchViewProps) => {
  return (
    <>
      <MainContent
        matchData={matchData}
        userPrediction={userPrediction}
        matchPredictions={matchPredictions}
        commentsModalHeightHiddenState={commentsModalHeightHiddenState}
      />
      <div className="fixed bottom-0 w-full">
        <PostComment />
      </div>

      {isShowVoteIcon && (
        <div
          className={clsx('fixed ', device === 'SP' ? 'right-[10px]' : 'right-[50px]')}
          style={{ bottom: voteIconBottomPosition }}
        >
          <VoteIcon
            isScroll={isScroll}
            showPredictionModal={showPredictionModal}
            bottomPosition={voteIconBottomPosition}
          />
        </div>
      )}
      {isShowPredictionModal && <PredictionVoteModal thisMatch={matchData} />}
    </>
  );
};

type MainProps = {
  matchData: MatchDataType;
  userPrediction: UsersPredictionType;
  matchPredictions: MatchPredictionsType | undefined;
  commentsModalHeightHiddenState: number;
};

const MainContent = ({
  matchData,
  userPrediction,
  matchPredictions,
  commentsModalHeightHiddenState,
}: MainProps) => {
  return (
    <div className="w-[100vw] overflow-auto">
      <div
        data-testid="match-main-content"
        className="w-full flex justify-center"
        style={{ paddingBottom: commentsModalHeightHiddenState }}
      >
        <MatchInfo
          matchData={matchData}
          userPrediction={userPrediction}
          matchPredictions={matchPredictions}
        />
      </div>
      <MatchCommentsModal matchId={matchData.id} />
    </div>
  );
};
