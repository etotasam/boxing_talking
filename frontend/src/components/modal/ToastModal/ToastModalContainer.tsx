// import React from "react";
import { AnimatePresence } from 'framer-motion';
import { ToastModal } from '.';

export const ToastModalContainer = ({ isShow }: { isShow: boolean }) => {
  return <AnimatePresence>{isShow && <ToastModal />}</AnimatePresence>;
};
