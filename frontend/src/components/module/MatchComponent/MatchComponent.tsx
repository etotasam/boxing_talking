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
//! image
import ringImg from '@/assets/images/etc/ring.jpg';
import GGG from '@/assets/images/etc/GGG.jpg';
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
export const MatchComponent = (props: PropsType) => {
  const { matchData, device, isShowPredictionModal, isVoteIconVisible, showPredictionModal } =
    props;

  const isScroll = useRecoilValue(boolState('IS_SCROLL'));

  return (
    <HeaderOnlyLayout>
      <div>
        <div className="flex">
          {device === 'PC' && (
            <section className="w-[30%]">
              <LeftSection matchData={matchData} />
            </section>
          )}

          <RightSectionWrapper device={device}>
            <Comments matchId={matchData.id} />
            <PostComment />
            {isVoteIconVisible && (
              <div className="fixed bottom-[75px] right-[10px]">
                <VoteIcon isScroll={isScroll} showPredictionModal={showPredictionModal} />
              </div>
            )}
          </RightSectionWrapper>
        </div>
      </div>

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

const RightSectionWrapper = ({
  children,
  device,
}: {
  children: ReactNode;
  device: 'PC' | 'SP';
}) => {
  const isCommentsFetching = useRecoilValue(
    apiFetchDataState({ dataName: 'comments/fetch', state: 'isLoading' })
  );
  return (
    <section
      className={clsx('relative', device === 'PC' ? 'w-[70%]' : 'w-full')}
      style={{
        backgroundImage: `url(${GGG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full h-full bg-fixed backdrop-blur-[1px] bg-neutral-900/90">
        {children}
        <CommentLoadingModal isShow={isCommentsFetching} />
      </div>
    </section>
  );
};
