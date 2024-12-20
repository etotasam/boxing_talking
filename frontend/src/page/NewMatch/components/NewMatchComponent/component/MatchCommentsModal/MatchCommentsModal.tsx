import { useState } from 'react';
import { motion } from 'framer-motion';
//! components
import { Comments } from '../Comments';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! icons
import { GoTriangleUp } from 'react-icons/go';

type PropsType = {
  matchId: number;
};

export const MatchCommentsModal = ({ matchId }: PropsType) => {
  const postCommentAreaHeight = useRecoilValue(elementSizeState('POST_COMMENT_HEIGHT'));
  const hiddenCommentsHeight: string = (postCommentAreaHeight ?? 0) + 50 + 'px';
  const [isShowComments, setIsShowComments] = useState(false);
  const toggleShowComments = () => setIsShowComments((v) => !v);
  return (
    <div className="h-[100vh] w-full">
      <motion.div
        initial={{ height: hiddenCommentsHeight }}
        animate={isShowComments ? { height: '80%' } : { height: hiddenCommentsHeight }}
        className="bg-black/40 w-full absolute bottom-0"
      >
        <motion.div
          //? translate-xが効かないので無理やり中央寄せにした( left-[calc(50%-15px)] 幅が30pxなので半分の15pxを引いている)
          className="absolute top-0 left-[calc(50%-15px)] z-10 cursor-pointer"
          animate={isShowComments ? { top: '-30px', rotate: 180 } : { top: '0px' }}
          onClick={toggleShowComments}
        >
          <GoTriangleUp className="w-[30px] h-[30px] text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={
            isShowComments
              ? { opacity: 1, transition: { duration: 0.5 } }
              : { opacity: 0, transition: { duration: 0.1 } }
          }
          // transition={{ duration: 0.5 }}
        >
          <Comments matchId={matchId} />
        </motion.div>
      </motion.div>
      {/* <div className="absolute bottom-0 w-full">
        <PostComment />
      </div> */}
    </div>
  );
};
