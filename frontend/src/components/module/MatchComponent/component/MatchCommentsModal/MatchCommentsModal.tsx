import { useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import { Comments } from '../Comments';
import { useFetchComments } from '@/hooks/apiHooks/comment';
import { useRecoilValue, useRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { GoChevronUp } from 'react-icons/go';
import { modalState } from '@/store/modalState';
import { RotatingLines } from 'react-loader-spinner';

type PropsType = {
  matchId: number;
};

export const MatchCommentsModal = ({ matchId }: PropsType) => {
  const {
    data: comments,
    refetchComments,
    isNextComments,
    commentFetchState,
  } = useFetchComments(matchId);
  const postCommentAreaHeight = useRecoilValue(elementSizeState('POST_COMMENT_HEIGHT'));
  const headerHeightState = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const hiddenCommentsHeight: number = (postCommentAreaHeight ?? 0) + 50;
  const [commentsModalHeightHiddenState, setCommentsModalHightHiddenState] = useRecoilState(
    elementSizeState('COMMENTS_MODAL_HIDDEN_HEIGHT')
  );

  useEffect(() => {
    setCommentsModalHightHiddenState(hiddenCommentsHeight);
  }, [hiddenCommentsHeight]);

  const [isShowComments, setIsShowComments] = useRecoilState(modalState('COMMENTS_MODAL'));
  const toggleShowComments = () => {
    if (commentFetchState === 'loading') return;
    return setIsShowComments((v) => !v);
  };

  const windowHeight = window.innerHeight;
  //   windowHeight - (headerHeightState ?? 0) < windowHeight * 0.8;
  //? コメントモーダルの高さはヘッダーの高さを引いた90%に設定
  const commentsModalHeight = Math.floor((windowHeight - (headerHeightState ?? 0)) * 0.9);

  return (
    <motion.div
      initial={{ height: commentsModalHeightHiddenState ?? 0 }}
      animate={
        isShowComments
          ? { height: commentsModalHeight }
          : { height: commentsModalHeightHiddenState }
      }
      className="fixed bottom-0 left-0 w-full rounded-t-[28px] border-t border-white/10 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black shadow-[0_-16px_40px_rgba(0,0,0,0.45)]"
    >
      <motion.div
        className={clsx(
          'absolute left-1/2 top-0 z-10 h-0 w-20 -translate-x-1/2',
          commentFetchState === 'loading' ? 'cursor-default' : 'cursor-pointer'
        )}
        onClick={toggleShowComments}
      >
        {commentFetchState === 'loading' ? (
          <CommentsLoadingIcon />
        ) : (
          <CommentsModalToggleButton isShowComments={isShowComments} />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={
          isShowComments
            ? { opacity: 1, transition: { duration: 0.5 } }
            : { opacity: 0, transition: { duration: 0.1 } }
        }
      >
        <Comments
          matchId={matchId}
          comments={comments}
          refetchComments={refetchComments}
          isNextComments={isNextComments}
          commentFetchState={commentFetchState}
        />
      </motion.div>
    </motion.div>
  );
};

type CommentsModalToggleButtonProps = {
  isShowComments: boolean;
};

const CommentsModalToggleButton = ({ isShowComments }: CommentsModalToggleButtonProps) => {
  return (
    <div className="absolute left-0 top-[-20px] flex h-8 w-20 items-center justify-center rounded-full border border-white/15 bg-zinc-800/95 shadow-[0_12px_26px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.55)]">
      <motion.span animate={isShowComments ? { rotate: 180 } : { rotate: 0 }}>
        <GoChevronUp className="h-6 w-6 stroke-[0.8] text-zinc-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
      </motion.span>
    </div>
  );
};

const CommentsLoadingIcon = () => {
  return (
    <div className="absolute left-0 top-[-20px] h-8 w-20 rounded-full border border-white/15 bg-zinc-800/95 text-white shadow-[0_12px_26px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.55)]">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 left-0 w-full h-full flex justify-center items-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex select-none"
        >
          <RotatingLines strokeColor="#f5f5f5" strokeWidth="3" animationDuration="1" width="20" />
        </motion.div>
      </motion.div>
    </div>
  );
};
