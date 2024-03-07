import { motion, AnimatePresence } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { modalState } from '@/store/modalState';

export const MenuModal = () => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const isShow = useRecoilValue(modalState('MENU'));
  return (
    <AnimatePresence>
      {isShow && (
        <motion.div
          initial={{ y: '-100vh', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100vh', opacity: 1, transition: { duration: 0.2 } }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: `calc(100vh - ${0}px)` }}
          className="bg-neutral-900 w-full z-10 fixed top-0 flex justify-center items-center text-white"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            MenuModal
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
