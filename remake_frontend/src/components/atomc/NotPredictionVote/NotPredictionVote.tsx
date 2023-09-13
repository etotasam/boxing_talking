import { MdHowToVote } from 'react-icons/md';
import { motion } from 'framer-motion';

export const NotPredictionVote = ({
  isPredictionVote,
}: {
  isPredictionVote: boolean | undefined;
}) => {
  return (
    <>
      {!isPredictionVote && isPredictionVote !== undefined && (
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
            translateX: 0,
            translateY: 0,
          }}
          transition={{ duration: 0.5 }}
          className="absolute top-[-15px] left-[-15px] flex justify-center items-center w-[40px] h-[40px] rounded-[50%] text-white bg-green-600"
        >
          <div className="text-[20px]">
            <MdHowToVote />
          </div>
        </motion.div>
      )}
    </>
  );
};
