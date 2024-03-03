import { useState, useEffect } from 'react';
import { MdHowToVote } from 'react-icons/md';
import { motion } from 'framer-motion';
//!type
import { MatchDataType } from '@/assets/types';
//! hook
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
import { useAllFetchMatchPredictionOfAuthUser } from '@/hooks/apiHooks/uesWinLossPrediction';

type IconType = 'DEFAULT' | 'MINI';

type PropsType = {
  matchData: MatchDataType;
  iconType?: IconType;
};

export const PredictionIconWrapper = ({ matchData, iconType = 'DEFAULT' }: PropsType) => {
  const { data: allPrediction } = useAllFetchMatchPredictionOfAuthUser();

  const { isFightToday, isDayOverFight } = useDayOfFightChecker(matchData);

  const [isHide, setIsHide] = useState(true);
  useEffect(() => {
    if (!Array.isArray(allPrediction)) return setIsHide(true);
    if (isDayOverFight === undefined || isDayOverFight === true) return setIsHide(true);
    if (isFightToday === undefined || isFightToday === true) return setIsHide(true);

    const isVoteToThisMatch = allPrediction.some((obj) => obj.matchId === matchData.id);
    setIsHide(isVoteToThisMatch);
  }, [allPrediction, isDayOverFight, isFightToday]);

  if (isHide) return;

  if (iconType === 'DEFAULT') return <PredictionIcon />;
  if (iconType === 'MINI') return <PredictionIconMini />;
};

const PredictionIcon = () => {
  return (
    <>
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
    </>
  );
};

const PredictionIconMini = () => {
  return (
    <div className="absolute top-[8px] left-[50%] translate-x-[-50%]">
      <div className="w-[24px] h-[24px] text-sm flex justify-center items-center rounded-[50%] text-white bg-green-600">
        <div>
          <MdHowToVote />
        </div>
      </div>
    </div>
  );
};
