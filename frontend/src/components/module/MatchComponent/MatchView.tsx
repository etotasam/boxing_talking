import clsx from 'clsx';

//! type
import { MatchDataType } from '@/types';
import { DeviceStateType } from '@/store/deviceState';

//! component
import { MatchInfo } from './component/MatchInfo';
import { PostComment } from './component/PostComment';
import { PredictionVoteModal } from './component/PredictionVoteModal';
import { VoteIcon } from './component/VoteIcon';
import { MatchCommentsModal } from './component/MatchCommentsModal';

export type MatchViewProps = {
  matchData: MatchDataType;
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
      <Main matchData={matchData} commentsModalHeightHiddenState={commentsModalHeightHiddenState} />
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
  commentsModalHeightHiddenState: number;
};

const Main = ({ matchData, commentsModalHeightHiddenState }: MainProps) => {
  return (
    <main className="w-[100vw] overflow-auto">
      <div
        className="w-full flex justify-center"
        style={{ paddingBottom: commentsModalHeightHiddenState }}
      >
        <MatchInfo matchData={matchData} />
      </div>
      <MatchCommentsModal matchId={matchData.id} />
    </main>
  );
};
