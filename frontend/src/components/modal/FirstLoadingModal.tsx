import { TailSpin } from 'react-loader-spinner';
import { motion, AnimatePresence } from 'framer-motion';
const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const FirstLoadingModal = ({ isShow }: { isShow: boolean }) => {
  return (
    <AnimatePresence>
      {isShow && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="z-[999] fixed top-0 left-0 bg-neutral-800 flex justify-center items-center w-[100vw] min-h-[100vh]"
        >
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, translateY: -30, transition: { duration: 0.3 } }}
            className=" text-stone-100"
          >
            <h1 className="lg:text-[50px] sm:text-[36px] text-[24px] font-thin text-center select-none">{siteTitle}</h1>
            <div className="flex justify-center items-center mt-8">
              <TailSpin color="#e3e3e3" height="35" width="35" ariaLabel="loading" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
