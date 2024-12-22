import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
//! icons
import { GiBoxingGlove } from 'react-icons/gi';

//! hook
import { useModalState } from '@/hooks/useModalState';
import { useWindowSize } from '@/hooks/useWindowSize';

export const VoteIcon = ({
  isScroll,
  showPredictionModal,
  bottomPosition,
}: {
  color?: string;
  isScroll: boolean;
  showPredictionModal: () => void;
  bottomPosition: number;
}) => {
  const { device } = useWindowSize();

  return (
    <AnimatePresence>
      <motion.div
        key={'vote_icon'}
        animate={
          isScroll
            ? { width: '70px', x: '-25px', transition: { duration: 0.3 } }
            : { width: '120px', x: '0px', transition: { duration: 0.3 } }
        }
        className={clsx(
          'fixed w-[120px] h-[35px] rounded-[50px] bg-black/80',
          device === 'SP' ? 'right-[10px]' : 'right-[50px]'
        )}
        style={{ bottom: bottomPosition }}
      />
      <div className="flex cursor-pointer rounded-[50px] px-1" onClick={showPredictionModal}>
        <motion.span
          animate={isScroll ? { x: '25px' } : { x: 0 }}
          transition={{ duration: 0.3 }}
          className=""
        >
          <GiBoxingGlove className="w-8 h-8 text-red-600 rotate-[-60deg]" />
        </motion.span>
        <motion.span
          animate={
            isScroll
              ? { opacity: 0, y: '10px', transition: { duration: 0.2 } }
              : { opacity: 1, y: '0px', transition: { duration: 0.5 } }
          }
          className="z-10 text-xs text-black bg-yellow-400 rounded-[50px] my-1 pt-1 px-2 mx-1"
        >
          投票
        </motion.span>
        <motion.span
          animate={isScroll ? { x: '-25px' } : { x: 0 }}
          transition={{ duration: 0.3 }}
          className=""
        >
          <GiBoxingGlove className="w-8 h-8 text-blue-600 rotate-[-180deg]" />
        </motion.span>
      </div>
    </AnimatePresence>
  );
};

export const VoteIconForTop = () => {
  return (
    <div className="relative">
      <span className="inline-block w-[25px] h-[25px] bg-black rounded-[50px] absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%]"></span>
      <motion.div
        animate={{ x: [0, 8, -3, 0] }}
        transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3 }}
        className="flex justify-center items-center"
      >
        <GiBoxingGlove className="w-[15px] h-[15px] text-red-600 rotate-[-40deg]" />
      </motion.div>
    </div>
  );
};
