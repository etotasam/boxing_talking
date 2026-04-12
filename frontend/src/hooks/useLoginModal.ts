import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { modalState } from '@/store/modalState';

export const useLoginModal = () => {
  const [state, setState] = useRecoilState(modalState('LOGIN'));

  const showLoginModal = useCallback(() => {
    setState(true);
  }, [setState]);

  const hideLoginModal = useCallback(() => {
    setState(false);
  }, [setState]);

  const toddleLoginModal = useCallback(() => {
    setState((curr) => {
      return !curr;
    });
  }, [setState]);

  return { state, showLoginModal, hideLoginModal, toddleLoginModal };
};
