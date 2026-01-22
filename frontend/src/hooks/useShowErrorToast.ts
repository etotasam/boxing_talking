import { MessageType } from '@/assets/types'
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from '@/assets/statusesOnToastModal';
import { useToastModal } from '@/hooks/useToastModal';



export const useShowErrorToast = () => {
  const { showToastModalMessage } = useToastModal();

  const showErrorToast = (condition: boolean, message: MessageType) => {
    if (condition) {
      showToastModalMessage({
        message: message,
        bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR,
      });
    }
  }
  return { showErrorToast };
}
