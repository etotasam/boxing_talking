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
//! image
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
  const { matchData, isShowPredictionModal, isVoteIconVisible, showPredictionModal } = props;

  const isScroll = useRecoilValue(boolState('IS_SCROLL'));

  return (
    <HeaderOnlyLayout>
      <Container>
        <Main matchData={matchData} />
        <MatchCommentsModal matchId={matchData.id} />
        <div className="absolute bottom-0 w-full">
          <PostComment />
        </div>
        {isVoteIconVisible && (
          <div className="fixed bottom-[75px] right-[10px]">
            <VoteIcon isScroll={isScroll} showPredictionModal={showPredictionModal} />
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
    <section className="w-full h-[100vh] flex justify-center">
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
    </section>
  );
};

const Main = ({ matchData }: { matchData: MatchDataType }) => {
  const headerHeightState = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  return (
    <div className="h-[100vh] w-[100vw] overflow-auto">
      <div
        className="w-full flex justify-center"
        style={{ paddingTop: headerHeightState, paddingBottom: '20vh' }}
      >
        <MatchInfo matchData={matchData} />
      </div>
    </div>
  );
};
