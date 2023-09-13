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
