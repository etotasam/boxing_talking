import { MessageType, BgColorType } from '@/assets/types'
import { BG_COLOR_ON_TOAST_MODAL } from '@/assets/statusesOnToastModal';
import { useToastModal } from '@/hooks/useToastModal';



export const useShowErrorToast = () => {
  const { showToastModalMessage } = useToastModal();

  const showErrorToast = (condition: boolean, message: MessageType, bgColor?: BgColorType): boolean => {
    if (condition) {
      showToastModalMessage({
        message: message,
        bgColor: bgColor ?? BG_COLOR_ON_TOAST_MODAL.ERROR,
      });

    }
    return condition;
  }
  return { showErrorToast };
}
