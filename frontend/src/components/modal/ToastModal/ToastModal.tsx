import React from "react";
import { motion } from "framer-motion";
import { WINDOW_WIDTH } from "@/libs/utils";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";

export const ToastModal = ({ windowWidth }: { windowWidth: number }) => {
  const { message, bgColor, clearToastModaleMessage } = useToastModal();

  const [color, setColor] = React.useState<string>();
  React.useEffect(() => {
    switch (bgColor) {
      case ModalBgColorType.ERROR:
        setColor("bg-rose-500");
        break;
      case ModalBgColorType.SUCCESS:
        setColor("bg-emerald-600");
        break;
      case ModalBgColorType.DELETE:
        setColor("bg-stone-700");
        break;
      case ModalBgColorType.NOTICE:
        setColor("bg-sky-600");
        break;
      case ModalBgColorType.GRAY:
        setColor("bg-stone-600");
        break;
      default:
        setColor("bg-gray-500");
    }
  }, [bgColor]);

  const mdVariant = {
    hidden: {
      y: 100,
      x: "-50%",
      transition: {
        duration: 0.5,
      },
    },
    visible: {
      y: "-150%",
      x: "-50%",
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const lgVariant = {
    hidden: {
      y: -100,
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
    // <AnimatePresence>
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={windowWidth > WINDOW_WIDTH.md ? lgVariant : mdVariant}
      // variants={mdVariant}
      onClick={clearToastModaleMessage}
      className={`z-[999] fixed top-[100vh] md:top-0 left-[50%] py-2 px-5 min-w-[80%] md:min-w-[30%] text-center text-white rounded whitespace-pre-wrap select-none ${color}`}
    >
      {message}
    </motion.div>
    // </AnimatePresence>
  );
};
