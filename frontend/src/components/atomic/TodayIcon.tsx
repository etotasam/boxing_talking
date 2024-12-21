import { motion } from 'framer-motion';
//!type
import { MatchDataType } from '@/assets/types';
//! hook
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';

type IconType = 'DEFAULT' | 'MINI';

type PropsType = {
  matchData: MatchDataType;
  iconType?: IconType;
};

export const TodayIcon = ({ matchData, iconType = 'DEFAULT' }: PropsType) => {
  const { isDayOnFight } = useDayOfFightChecker(matchData.matchDate);

  if (!isDayOnFight) return;

  if (iconType === 'DEFAULT') return <Icon />;
  if (iconType === 'MINI') return <IconMini />;
};

const Icon = () => {
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
        className="absolute top-[-15px] left-[-15px] flex justify-center items-center rounded-[50%] text-white bg-red-600"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-[20px]"
        >
          Today
          {/* <RiBoxingFill /> */}
        </motion.div>
      </motion.div>
    </>
  );
};

const IconMini = () => {
  return (
    <div className="absolute top-[8px] left-[50%] translate-x-[-50%]">
      <div className="w-[24px] h-[24px] text-sm flex justify-center items-center rounded-[50%] text-white bg-red-600">
        <div>
          Today
          {/* <RiBoxingFill /> */}
        </div>
      </div>
    </div>
  );
};
