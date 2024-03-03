import React from 'react';
import { motion } from 'framer-motion';
import { RotatingLines } from 'react-loader-spinner';

export const FullScreenSpinnerModal = () => {
  React.useEffect(() => {
    document.body.style.overflowY = 'hidden';
    return () => {
      document.body.style.overflowY = 'scroll';
    };
  }, []);
  return (
    <div
      className={`z-50 w-[100vw] h-[100vh] fixed top-0 left-0 flex justify-center items-center bg-neutral-900/90`}
    >
      {/* <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      > */}
      <RotatingLines strokeColor="#ffffff" strokeWidth="3" animationDuration="1" width="60" />
      {/* </motion.span> */}
    </div>
  );
};
