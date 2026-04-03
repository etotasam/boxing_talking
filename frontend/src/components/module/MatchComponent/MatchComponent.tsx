import clsx from 'clsx';

//! type
import { MatchDataType } from '@/types';
import { DeviceStateType } from '@/store/deviceState';

//! component
import { MatchInfo } from './component/MatchInfo';
import { PostComment } from './component/PostComment';

import { VoteIcon } from './component/VoteIcon';
import { MatchCommentsModal } from './component/MatchCommentsModal';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { boolState } from '@/store/boolState';

type PropsType = {
  matchData: MatchDataType;
  device: DeviceStateType;
  isShowPredictionModal: boolean;
  showPredictionModal: () => void;
  // isHide: boolean;
  isShowVoteIcon: boolean;
};
export const MatchComponent = (props: PropsType) => {
  const { matchData, isShowVoteIcon, showPredictionModal, device } = props;

  const isScroll = useRecoilValue(boolState('IS_SCROLL'));

  //? vote iconの位置はコメント入力欄の高さに準ずる
  const voteIconBottomPosition = (useRecoilValue(elementSizeState('POST_COMMENT_HEIGHT')) ?? 0) + 5;

  return (
    <>
      <Main matchData={matchData} />
      {/* <MatchCommentsModal matchId={matchData.id} /> */}
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
      {/* {isShowPredictionModal && <PredictionVoteModal thisMatch={matchData} />} */}
    </>
  );
};

const Main = ({ matchData }: { matchData: MatchDataType }) => {
  //? コメントモーダルが非表示時の高さ分をpaddingにしてスクロールされる様にする
  const commentsModalHeightHiddenState = useRecoilValue(
    elementSizeState('COMMENTS_MODAL_HIDDEN_HEIGHT')
  );

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
