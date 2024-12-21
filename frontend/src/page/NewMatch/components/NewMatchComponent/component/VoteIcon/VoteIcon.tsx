import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
//! icons
import { MdHowToVote } from 'react-icons/md';
//! hook
import { useModalState } from '@/hooks/useModalState';

export const VoteIcon = ({
  color,
  isScroll,
  showPredictionModal,
}: {
  color?: string;
  isScroll: boolean;
  showPredictionModal: () => void;
}) => {
  const textColor = color ?? 'text-neutral-200';

  return (
    <AnimatePresence>
      <motion.div className="rounded-[50px] w-[90px] h-[28px]">
        <motion.div
          onClick={showPredictionModal}
          initial={{ width: '90px', height: '28px' }}
          animate={
            !isScroll
              ? { x: '0px', width: '90px', height: '28px' }
              : { x: '62px', width: '28px', height: '28px' }
          }
          transition={{ ease: 'linear' }}
          className={clsx(
            'relative cursor-pointer bg-green-800 rounded-[50px] flex items-center whitespace-nowrap overflow-hidden',
            textColor
          )}
        >
          <span className="pl-[6px]">
            <MdHowToVote />
          </span>
          <span className="absolute top-[50%] translate-y-[-50%] left-[30px] text-xs font-bold tracking-widest">
            勝敗投票
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
