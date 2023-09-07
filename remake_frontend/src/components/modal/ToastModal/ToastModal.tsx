import React from "react";
import { motion } from "framer-motion";
//! message contoller
import { BG_COLOR_ON_TOAST_MODAL } from "@/assets/statusesOnToastModal";
// ! hooks
import { useToastModal } from "@/hooks/useToastModal";

export const ToastModal = () => {
  const { messageOnToast, bgColor, hideToastModal } = useToastModal();

  const hideModal = () => {
    hideToastModal();
  };

  const [color, setColor] = React.useState<string>();
  React.useEffect(() => {
    switch (bgColor) {
      case BG_COLOR_ON_TOAST_MODAL.ERROR:
        setColor("bg-rose-500");
        break;
      case BG_COLOR_ON_TOAST_MODAL.SUCCESS:
        setColor("bg-emerald-600");
        break;
      case BG_COLOR_ON_TOAST_MODAL.DELETE:
        setColor("bg-stone-700");
        break;
      case BG_COLOR_ON_TOAST_MODAL.NOTICE:
        setColor("bg-sky-600");
        break;
      case BG_COLOR_ON_TOAST_MODAL.GRAY:
        setColor("bg-stone-600");
        break;
      default:
        setColor("bg-gray-500");
    }
  }, [bgColor]);

  const variants = {
    hidden: {
      y: 100,
      x: "-50%",
      transition: {
        duration: 0.5,
      },
    },
    visible: {
      y: "50%",
      x: "-50%",
      transition: {
        duration: 0.5,
        ease: "easeOut",
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
      className={`cursor-pointer z-[999] fixed bottom-[50px] left-[50%] py-2 px-5 min-w-[80%] md:min-w-[30%] text-center text-white rounded whitespace-pre-wrap select-none ${color}`}
    >
      {messageOnToast}
    </motion.div>
  );
};
