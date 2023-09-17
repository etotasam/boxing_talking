import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { MdHowToVote } from 'react-icons/md';
import { motion } from 'framer-motion';
//!hook
import { useGuest, useAuth } from '@/hooks/useAuth';

export const PredictionVoteIcon = ({
  isPredictionVote,
  thisMatchDate,
}: {
  isPredictionVote: boolean | undefined;
  thisMatchDate: string;
}) => {
  const { data: authUser } = useAuth();
  const { data: isGuest } = useGuest();
  const [isShowPredictionIton, setIsShowPredictionIcon] = useState(false);
  const [matchIsAfterToday, setMatchIsAfterToday] = useState<boolean>();

  useEffect(() => {
    setIsShowPredictionIcon(
      Boolean(
        (authUser || isGuest) &&
          !isPredictionVote &&
          isPredictionVote !== undefined &&
          matchIsAfterToday
      )
    );
  }, [isPredictionVote, authUser, isGuest, matchIsAfterToday]);

  //? 試合の日が当日以降かどうか
  useEffect(() => {
    if (!thisMatchDate) return;
    const todaySubtractOneSecond = dayjs().startOf('day').add(1, 'second');
    const isAfterToday = dayjs(thisMatchDate).isAfter(todaySubtractOneSecond);
    setMatchIsAfterToday(isAfterToday);
  }, [thisMatchDate]);

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
