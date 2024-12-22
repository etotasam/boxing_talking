import { ReactNode } from 'react';
import clsx from 'clsx';

//! type
import { MatchDataType } from '@/assets/types';
//! layout
import HeaderOnlyLayout from '@/layout/HeaderOnlyLayout';

//! component
import { MatchInfo } from './component/MatchInfo';
import { PostComment } from './component/PostComment';
import { PredictionVoteModal } from './component/PredictionVoteModal';

import { VoteIcon } from './component/VoteIcon';
import { MatchCommentsModal } from './component/MatchCommentsModal';
//! image/icon
import GGGPhoto from '@/assets/images/etc/GGG.jpg';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { boolState } from '@/store/boolState';

type PropsType = {
  matchData: MatchDataType;
  device: 'PC' | 'SP';
  isShowPredictionModal: boolean;
  showPredictionModal: () => void;
  // isHide: boolean;
  isVoteIconVisible: boolean;
};
export const NewMatchComponent = (props: PropsType) => {
  const { matchData, isShowPredictionModal, isVoteIconVisible, showPredictionModal, device } =
    props;

  const isScroll = useRecoilValue(boolState('IS_SCROLL'));

  //? vote iconの位置はコメント入力欄の高さに準ずる
  const voteIconBottomPosition = (useRecoilValue(elementSizeState('POST_COMMENT_HEIGHT')) ?? 0) + 5;

  return (
    <HeaderOnlyLayout>
      <Container>
        <Main matchData={matchData} />
        <MatchCommentsModal matchId={matchData.id} />
        <div className="absolute bottom-0 w-full">
          <PostComment />
        </div>

        {isVoteIconVisible && (
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
      </Container>

      {isShowPredictionModal && <PredictionVoteModal thisMatch={matchData} />}
    </HeaderOnlyLayout>
  );
};

const Container = ({ children }: { children: ReactNode }) => {
  // const headerHeightState = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  return (
    <div className="w-full h-[100vh] flex justify-center">
      <div
        className={clsx('relative w-full')}
        style={{
          backgroundImage: `url(${GGGPhoto})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className={'w-full h-full bg-fixed backdrop-blur-[1px] bg-neutral-900/90'}>
          {children}
        </div>
      </div>
    </div>
  );
};

const Main = ({ matchData }: { matchData: MatchDataType }) => {
  const headerHeightState = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  //? コメントモーダルが非表示時の高さ分をpaddingにしてスクロールされる様にする
  const commentsModalHeightHiddenState = useRecoilValue(
    elementSizeState('COMMENTS_MODAL_HIDDEN_HEIGHT')
  );

  return (
    <main className="h-[100vh] w-[100vw] overflow-auto">
      <div
        className="w-full flex justify-center"
        style={{ paddingTop: headerHeightState, paddingBottom: commentsModalHeightHiddenState }}
      >
        <MatchInfo matchData={matchData} />
      </div>
    </main>
  );
};
