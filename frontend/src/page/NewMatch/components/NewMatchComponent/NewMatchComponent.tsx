import { ReactNode } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
//! type
import { MatchDataType } from '@/assets/types';
//! layout
import HeaderOnlyLayout from '@/layout/HeaderOnlyLayout';
//! component
import { PostComment } from './component/PostComment';
import { Comments } from './component/Comments';
import { LeftSection } from './component/LeftSection';
import { PredictionVoteModal } from './component/PredictionVoteModal';
import { VoteIcon } from './component/VoteIcon';
import { MatchCommentsModal } from './component/MatchCommentsModal';
// import { NewComments } from './component/NewComments';
//! image
import GGGPhoto from '@/assets/images/etc/GGG.jpg';
//! icons
import { RotatingLines } from 'react-loader-spinner';
//! recoil
import { useRecoilValue } from 'recoil';
import { apiFetchDataState } from '@/store/apiFetchDataState';
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
  const { matchData, device, isShowPredictionModal, isVoteIconVisible, showPredictionModal } =
    props;

  const isScroll = useRecoilValue(boolState('IS_SCROLL'));

  return (
    <HeaderOnlyLayout>
      <MainContent device={device}>
        <MatchCommentsModal matchId={matchData.id} />
        {/* <Comments matchId={matchData.id} /> */}
        <div className="absolute bottom-0 w-full">
          <PostComment />
        </div>
        {isVoteIconVisible && (
          <div className="fixed bottom-[75px] right-[10px]">
            <VoteIcon isScroll={isScroll} showPredictionModal={showPredictionModal} />
          </div>
        )}
      </MainContent>

      {isShowPredictionModal && <PredictionVoteModal thisMatch={matchData} />}
    </HeaderOnlyLayout>
  );
};

const CommentLoadingModal = ({ isShow }: { isShow: boolean }) => {
  const text = 'コメント取得中...';
  return (
    <AnimatePresence>
      {isShow && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-0 w-full h-full bg-black/60 flex justify-center items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex select-none"
          >
            <RotatingLines strokeColor="#f5f5f5" strokeWidth="3" animationDuration="1" width="20" />
            <span className="ml-1 text-neutral-200/60 text-sm">{text}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MainContent = ({ children, device }: { children: ReactNode; device: 'PC' | 'SP' }) => {
  const isCommentsFetching = useRecoilValue(
    apiFetchDataState({ dataName: 'comments/fetch', state: 'isLoading' })
  );
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
        <div className="w-full h-full bg-fixed backdrop-blur-[1px] bg-neutral-900/90">
          {children}
          <CommentLoadingModal isShow={isCommentsFetching} />
        </div>
      </div>
    </section>
  );
};
