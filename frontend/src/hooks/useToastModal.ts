import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { toastModalState } from '@/store/toastModalState';
import { MessageType, BgColorType } from '@/types';
import { BG_COLOR_ON_TOAST_MODAL } from '@/assets/statusesOnToastModal';

export const useToastModal = () => {
  //? ToastModalの状態(show/hide)
  const [{ isShow: isShowToastModal, message: messageOnToast, bgColor }, setter] =
    useRecoilState(toastModalState);

  /**
   * ! ToastModalを隠す
   */
  const hideToastModal = useCallback(() => {
    setter((current) => {
      return { ...current, isShow: false };
    });
  }, [setter]);

  const showToastModalMessage = useCallback(
    ({ message, bgColor }: { message: MessageType; bgColor: BgColorType }) => {
      setter((current) => {
        return { ...current, message, bgColor, isShow: true };
      });
    },
    [setter]
  );

  const showErrorToast = useCallback(
    (message: MessageType): void => {
      showToastModalMessage({ message, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR });
    },
    [showToastModalMessage]
  );

  const showSuccessToast = useCallback(
    (message: MessageType): void => {
      showToastModalMessage({ message, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS });
    },
    [showToastModalMessage]
  );

  const showNoticeToast = useCallback(
    (message: MessageType): void => {
      showToastModalMessage({ message, bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE });
    },
    [showToastModalMessage]
  );

  const showGrayBackToast = useCallback(
    (message: MessageType): void => {
      showToastModalMessage({ message, bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY });
    },
    [showToastModalMessage]
  );

  return {
    showErrorToast,
    showSuccessToast,
    showNoticeToast,
    showGrayBackToast,
    hideToastModal,
    messageOnToast,
    bgColor,
    isShowToastModal,
  };
};
