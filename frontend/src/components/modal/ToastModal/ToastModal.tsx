import React from 'react';
import { motion } from 'framer-motion';
//! message controller
import { BG_COLOR_ON_TOAST_MODAL } from '@/assets/statusesOnToastModal';
//! type
import { MessageType, BgColorType } from '@/assets/types';

export type PropsType = {
  hideToastModal: () => void;
  bgColor: BgColorType;
  messageOnToast: MessageType;
};
export const ToastModal = (props: PropsType) => {
  const { messageOnToast, bgColor, hideToastModal } = props;

  const hideModal = () => {
    hideToastModal();
  };

  const [color, setColor] = React.useState<string>();
  React.useEffect(() => {
    switch (bgColor) {
      case BG_COLOR_ON_TOAST_MODAL.ERROR:
        setColor('bg-red-800 text-white');
        break;
      case BG_COLOR_ON_TOAST_MODAL.SUCCESS:
        setColor('bg-neutral-200 text-neutral-800');
        break;
      case BG_COLOR_ON_TOAST_MODAL.DELETE:
        setColor('bg-stone-700 text-white');
        break;
      case BG_COLOR_ON_TOAST_MODAL.NOTICE:
        setColor('bg-blue-900 text-white');
        break;
      case BG_COLOR_ON_TOAST_MODAL.GRAY:
        setColor('bg-stone-700 text-white');
        break;
      default:
        setColor('bg-neutral-800 text-white');
    }
  }, [bgColor]);

  const variants = {
    hidden: {
      y: -80,
      x: '-50%',
      transition: {
        duration: 0.5,
      },
    },
    visible: {
      y: '50%',
      x: '-50%',
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants}
      onClick={hideModal}
      className={`cursor-pointer z-[999] fixed top-[10px] left-[50%] py-2 px-5 min-w-[80%] md:min-w-[30%] text-center rounded-lg whitespace-pre-wrap select-none  ${color}`}
    >
      {messageOnToast}
    </motion.div>
  );
};
