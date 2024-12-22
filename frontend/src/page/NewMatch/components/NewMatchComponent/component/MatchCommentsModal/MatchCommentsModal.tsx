import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

//! components
import { Comments } from '../Comments';
//! recoil
import { useRecoilValue, useRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { apiFetchDataState } from '@/store/apiFetchDataState';
//! icons
import { GoTriangleUp } from 'react-icons/go';
import { modalState } from '@/store/modalState';
import { RotatingLines } from 'react-loader-spinner';

type PropsType = {
  matchId: number;
};

export const MatchCommentsModal = ({ matchId }: PropsType) => {
  const isCommentsFirstFetchingState = useRecoilValue(
    apiFetchDataState({ dataName: 'comments/fetch', state: 'isLoading' })
  );
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
    if (isCommentsFirstFetchingState) return;
    return setIsShowComments((v) => !v);
  };

  const windowHeight = window.innerHeight;
  // const isCommentsModalHeightSmallThen80Percent =
  //   windowHeight - (headerHeightState ?? 0) < windowHeight * 0.8;
  //? コメントモーダルの高さはヘッダーの高さを引いた90%に設定
  const commentsModalHeight = Math.floor((windowHeight - (headerHeightState ?? 0)) * 0.9);

  return (
    // <div className="h-[100vh] w-full">
    <motion.div
      initial={{ height: commentsModalHeightHiddenState ?? 0 }}
      animate={
        isShowComments
          ? { height: commentsModalHeight }
          : { height: commentsModalHeightHiddenState }
      }
      className="bg-black/90 w-full absolute bottom-0"
    >
      <motion.div
        //? translate-xが効かないので無理やり中央寄せにした( left-[calc(50%-15px)] 幅が30pxなので半分の15pxを引いている)
        className={clsx(
          'absolute top-0 left-[calc(50%-15px)] z-10',
          isCommentsFirstFetchingState ? 'cursor-default' : 'cursor-pointer'
        )}
        animate={isShowComments ? { top: '-30px', rotate: 180 } : { top: '0px' }}
        onClick={toggleShowComments}
      >
        {isCommentsFirstFetchingState ? <CommentsLoadingIcon /> : <CommentsModalToggleButton />}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={
          isShowComments
            ? { opacity: 1, transition: { duration: 0.5 } }
            : { opacity: 0, transition: { duration: 0.1 } }
        }
      >
        <Comments matchId={matchId} />
      </motion.div>
    </motion.div>
    // </div>
  );
};

const CommentsModalToggleButton = () => {
  return <GoTriangleUp className="w-[30px] h-[30px] text-white" />;
};

const CommentsLoadingIcon = () => {
  // const text = 'コメント取得中...';
  return (
    <div className="w-[30px] h-[30px] text-white">
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
