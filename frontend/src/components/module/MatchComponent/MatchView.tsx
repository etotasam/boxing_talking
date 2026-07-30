import { MatchDataType } from '@/types';
import { MatchPredictionsType } from '@/types';

import { MatchInfo } from './component/MatchInfo';
import { PostComment } from './component/PostComment';
import { PredictionVoteModal } from './component/PredictionVoteModal';
import { MatchCommentsModal } from './component/MatchCommentsModal';

export type UsersPredictionType = 'red' | 'blue' | false | undefined;

export type MatchViewProps = {
  matchData: MatchDataType;
  userPrediction: UsersPredictionType;
  matchPredictions: MatchPredictionsType | undefined;
  isMatchPredictionsLoading: boolean;
  isShowPredictionModal: boolean;
  showPredictionModal: () => void;
  isShowVoteIcon: boolean;
  commentsModalHeightHiddenState: number;
};

export const MatchView = ({
  matchData,
  userPrediction,
  matchPredictions,
  isMatchPredictionsLoading,
  isShowPredictionModal,
  showPredictionModal,
  isShowVoteIcon,
  commentsModalHeightHiddenState,
}: MatchViewProps) => {
  return (
    <>
      <MainContent
        matchData={matchData}
        userPrediction={userPrediction}
        matchPredictions={matchPredictions}
        isMatchPredictionsLoading={isMatchPredictionsLoading}
        showPredictionModal={showPredictionModal}
        isShowVoteIcon={isShowVoteIcon}
        commentsModalHeightHiddenState={commentsModalHeightHiddenState}
      />
      <div className="fixed bottom-0 inset-x-0">
        <PostComment />
      </div>

      {isShowPredictionModal && <PredictionVoteModal thisMatch={matchData} />}
    </>
  );
};

type MainProps = {
  matchData: MatchDataType;
  userPrediction: UsersPredictionType;
  matchPredictions: MatchPredictionsType | undefined;
  isMatchPredictionsLoading: boolean;
  showPredictionModal: () => void;
  isShowVoteIcon: boolean;
  commentsModalHeightHiddenState: number;
};

const MainContent = ({
  matchData,
  userPrediction,
  matchPredictions,
  isMatchPredictionsLoading,
  showPredictionModal,
  isShowVoteIcon,
  commentsModalHeightHiddenState,
}: MainProps) => {
  const MATCH_MAIN_CONTENT_BOTTOM_GAP = 32;
  return (
    <div className="w-full overflow-auto">
      <div
        data-testid="match-main-content"
        className="flex justify-center"
        style={{ paddingBottom: commentsModalHeightHiddenState + MATCH_MAIN_CONTENT_BOTTOM_GAP }}
      >
        <MatchInfo
          matchData={matchData}
          userPrediction={userPrediction}
          matchPredictions={matchPredictions}
          isMatchPredictionsLoading={isMatchPredictionsLoading}
          isShowVoteButton={isShowVoteIcon}
          showPredictionModal={showPredictionModal}
        />
      </div>
      <MatchCommentsModal matchId={matchData.id} />
    </div>
  );
};
