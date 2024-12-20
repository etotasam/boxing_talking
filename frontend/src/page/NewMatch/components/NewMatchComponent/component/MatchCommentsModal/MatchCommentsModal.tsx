import { useState } from 'react';
import { motion } from 'framer-motion';
//! components
import { Comments } from '../Comments';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';

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
        <div
          className="bg-black/40 text-white absolute top-[-20px] left-[50%] translate-x-[-50%] cursor-pointer"
          onClick={toggleShowComments}
        >
          Button
        </div>

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
