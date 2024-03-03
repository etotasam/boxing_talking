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
//! image
import ringImg from '@/assets/images/etc/ring.jpg';
//! icons
import { RotatingLines } from 'react-loader-spinner';
//! recoil
import { useRecoilValue } from 'recoil';
import { apiFetchDataState } from '@/store/apiFetchDataState';

type PropsType = {
  matchData: MatchDataType;
  device: 'PC' | 'SP';
  isShowPredictionModal: boolean;
};
export const MatchComponent = (props: PropsType) => {
  const { matchData, device, isShowPredictionModal } = props;

  return (
    <HeaderOnlyLayout>
      <div
        className="bg-fixed w-[100vw] h-[100vh]"
        style={{ backgroundImage: `url(${ringImg})`, backgroundSize: 'cover' }}
      >
        <div className="flex w-full h-full bg-fixed backdrop-blur-sm bg-stone-950/90">
          {device === 'PC' && (
            <section className="w-[30%]">
              <LeftSection matchData={matchData} />
            </section>
          )}

          <section className={clsx('relative', device === 'PC' ? 'w-[70%]' : 'w-full')}>
            <Comments matchId={matchData.id} />
            <PostComment />
            <CommentLoadingModal />
          </section>
        </div>
      </div>

      {isShowPredictionModal && <PredictionVoteModal thisMatch={matchData} />}
    </HeaderOnlyLayout>
  );
};

const CommentLoadingModal = () => {
  const isCommentFetching = useRecoilValue(
    apiFetchDataState({ dataName: 'comments/fetch', state: 'isLoading' })
  );

  const text = 'コメント取得中...';
  return (
    <AnimatePresence>
      {isCommentFetching && (
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
