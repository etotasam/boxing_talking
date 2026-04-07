import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { modalState, ModalNameType } from '@/store/modalState';

export const useModalState = (modalName: ModalNameType) => {
  const [state, setter] = useRecoilState(modalState(modalName));

  const hideModal = useCallback(() => {
    setter(false);
  }, [setter]);

  const showModal = useCallback(() => {
    setter(true);
  }, [setter]);

  return { state, hideModal, showModal };
};
