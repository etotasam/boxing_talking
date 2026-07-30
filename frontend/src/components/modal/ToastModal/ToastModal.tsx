import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BG_COLOR_ON_TOAST_MODAL } from '@/constants/statusesOnToastModal';
import { MessageType, BgColorType } from '@/types';

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

  //? ESCキーでモーダルを閉じる
  useEffect(() => {
    const Esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideToastModal();
      }
    };
    window.addEventListener('keydown', Esc);
    return () => window.removeEventListener('keydown', Esc);
  }, []);

  //? bgColorに対応するCSSクラスのマッピング
  const bgColorClassMap: Record<BgColorType, string> = {
    [BG_COLOR_ON_TOAST_MODAL.ERROR]: 'bg-red-800 text-white',
    [BG_COLOR_ON_TOAST_MODAL.SUCCESS]: 'bg-green-600 text-white',
    [BG_COLOR_ON_TOAST_MODAL.DELETE]: 'bg-stone-700 text-white',
    [BG_COLOR_ON_TOAST_MODAL.NOTICE]: 'bg-blue-900 text-white',
    [BG_COLOR_ON_TOAST_MODAL.GRAY]: 'bg-stone-700 text-white',
    [BG_COLOR_ON_TOAST_MODAL.NULL]: 'bg-neutral-800 text-white',
  };
  const color = bgColorClassMap[bgColor];

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
      className={`cursor-pointer z-[999] fixed top-[10px] left-[50%] py-2 px-5 min-w-[80%] pc:min-w-[30%] text-center rounded-lg whitespace-pre-wrap select-none  ${color}`}
    >
      {messageOnToast}
    </motion.div>
  );
};
