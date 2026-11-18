import { TailSpin } from 'react-loader-spinner';
import { motion, AnimatePresence } from 'framer-motion';
import ringBackground from '@/assets/images/etc/first-loading-ring.jpg';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const FirstLoadingModal = ({ isShow }: { isShow: boolean }) => {
  return (
    <AnimatePresence>
      {isShow && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#101010] bg-cover bg-center px-4"
          style={{ backgroundImage: `url("${ringBackground}")` }}
        >
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, translateY: -30, transition: { duration: 0.3 } }}
            className="text-stone-100"
          >
            <h1 className="select-none text-center font-['Bebas_Neue'] text-[clamp(36px,7vw,88px)] font-normal tracking-[0.04em]">
              {siteTitle}
            </h1>
            <div className="flex justify-center items-center mt-8">
              <TailSpin
                color="#dc2626"
                height="35"
                width="35"
                strokeWidth="5"
                radius="1"
                ariaLabel="loading"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
