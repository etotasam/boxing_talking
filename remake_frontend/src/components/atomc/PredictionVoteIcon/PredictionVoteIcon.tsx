import dayjs from 'dayjs';
import { MdHowToVote } from 'react-icons/md';
import { motion } from 'framer-motion';
//!hook

export const PredictionVoteIcon = () => {
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

export const PredictionVoteIconMini = () => {
  return (
    <>
      <div className="w-[24px] h-[24px] text-sm flex justify-center items-center rounded-[50%] text-white bg-green-600">
        <div>
          <MdHowToVote />
        </div>
      </div>
    </>
  );
};
