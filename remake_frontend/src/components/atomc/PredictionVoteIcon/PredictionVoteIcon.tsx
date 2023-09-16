import { MdHowToVote } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
//!hook
import { useGuest, useAuth } from '@/hooks/useAuth';

export const PredictionVoteIcon = ({
  isPredictionVote,
}: {
  isPredictionVote: boolean | undefined;
}) => {
  const { data: authUser } = useAuth();
  const { data: isGuest } = useGuest();
  const [isShowPredictionIton, setIsShowPredictionIcon] = useState(false);

  useEffect(() => {
    setIsShowPredictionIcon(
      Boolean(
        (authUser || isGuest) &&
          !isPredictionVote &&
          isPredictionVote !== undefined
      )
    );
  }, [isPredictionVote, authUser, isGuest]);

  return (
    <>
      {isShowPredictionIton && (
        <motion.div
          initial={{
            width: 0,
            height: 0,
            translateX: '20px',
            translateY: '20px',
          }}
          animate={{
            width: '40px',
            height: '40px',
            translateX: '0px',
            translateY: '0px',
          }}
          transition={{ duration: 0.3 }}
          className="absolute top-[-15px] left-[-15px] flex justify-center items-center rounded-[50%] text-white bg-green-600"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-[20px]"
          >
            <MdHowToVote />
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
