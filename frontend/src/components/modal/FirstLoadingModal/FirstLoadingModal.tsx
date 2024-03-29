import { TailSpin } from 'react-loader-spinner';
import { motion } from 'framer-motion';
const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const FirstLoadingModal = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="z-[999] fixed top-0 left-0 bg-white flex justify-center items-center w-[100vw] min-h-[100vh]"
    >
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, translateY: -30, transition: { duration: 0.3 } }}
        className="bg-white text-stone-700"
      >
        <h1 className="lg:text-[50px] sm:text-[36px] text-[24px] font-thin text-center select-none">
          {siteTitle}
        </h1>
        <div className="flex justify-center items-center mt-8">
          <TailSpin
            color="#1e1e1e"
            height="35"
            width="35"
            ariaLabel="loading"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
