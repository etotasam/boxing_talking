import { AnimatePresence } from 'framer-motion';
import { ToastModal } from '.';
// ! hooks
import { useToastModal } from '@/hooks/useToastModal';

export const ToastModalContainer = ({ isShow }: { isShow: boolean }) => {
  //? ToastModalの状態(show/hide)
  const { messageOnToast, bgColor, hideToastModal } = useToastModal();
  const props = { messageOnToast, bgColor, hideToastModal };

  return <AnimatePresence>{isShow && <ToastModal {...props} />}</AnimatePresence>;
};
