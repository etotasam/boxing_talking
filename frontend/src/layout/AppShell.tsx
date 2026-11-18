import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { modalState } from '@/store/modalState';
import { ROUTE_PATH } from '@/constants/routePath';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useFetchBoxers } from '@/hooks/apiHooks/boxer';
import { useAuth, useGuest } from '@/hooks/apiHooks/auth';
import { useFetchMatches } from '@/hooks/apiHooks/match';
import { useToastModal } from '@/hooks/useToastModal';
import { useInitializeDevice } from '@/hooks/useInitializeDevice';
import { useLoginModal } from '@/hooks/useLoginModal';
import { FirstLoadingModal } from '@/components/modal/FirstLoadingModal';
import { FullScreenSpinnerModal } from '@/components/modal/FullScreenSpinnerModal';
import { LoginFormModal } from '@/components/modal/LoginFormModal';
import { ToastModal } from '@/components/modal/ToastModal';

const AppShell = () => {
  useInitializeDevice();

  const { isLoading: isFullScreenLoading } = useFullScreenLoading();
  const { isLoading: isBoxersFetching, isRefetching: isRefetchingBoxers } = useFetchBoxers();
  const isShowFullScreenSpinnerCondition = isFullScreenLoading || isRefetchingBoxers;
  const isShowCommentsModal = useRecoilValue(modalState('COMMENTS_MODAL'));
  const isScrollLocked = isShowFullScreenSpinnerCondition || isShowCommentsModal;

  useEffect(() => {
    if (!isScrollLocked) return;

    const previousOverflowY = document.body.style.overflowY;
    document.body.style.overflowY = 'hidden';

    return () => {
      document.body.style.overflowY = previousOverflowY;
    };
  }, [isScrollLocked]);

  const { data: isAuth, isLoading: isFirstCheckingAuth } = useAuth();
  const { data: isGuest } = useGuest();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state: isShowLoginModal, showLoginModal, hideLoginModal } = useLoginModal();

  useEffect(() => {
    const isAuthUndefined = isAuth === undefined || isGuest === undefined;
    if (isAuthUndefined) return;

    if (!isAuth && !isGuest && pathname !== ROUTE_PATH.IDENTIFICATION) {
      showLoginModal();
      navigate(ROUTE_PATH.HOME);
      return;
    }

    hideLoginModal();
  }, [hideLoginModal, isAuth, isGuest, navigate, pathname, showLoginModal]);

  const { isLoading: isMatchesFetching } = useFetchMatches();

  const isShowFirstLoadingCondition = [
    isFirstCheckingAuth,
    isBoxersFetching,
    isMatchesFetching,
  ].some((condition) => condition);

  const { isShowToastModal, hideToastModal, messageOnToast } = useToastModal();

  const waitTime = 5000;
  const waitId = React.useRef<NodeJS.Timeout>();
  //? メッセージモーダルのタイマーセット
  useEffect(() => {
    if (!isShowToastModal) return;
    (async () => {
      if (waitId.current) clearTimeout(waitId.current);
      await wait(waitTime);
      hideToastModal();
    })();
  }, [isShowToastModal, messageOnToast]);

  const wait = (ms: number) => {
    return new Promise((resolve) => {
      const id: NodeJS.Timeout = setTimeout(resolve, ms);
      waitId.current = id;
    });
  };

  return (
    <>
      <LoginFormModal isShow={isShowLoginModal} key={'LoginFormModal'} />
      <FullScreenSpinnerModal
        isShow={isShowFullScreenSpinnerCondition}
        key={'FullScreenSpinnerModal'}
      />
      <FirstLoadingModal isShow={isShowFirstLoadingCondition} key={'FirstLoadingModal'} />
      <ToastModal isShow={isShowToastModal} key={'ToastModal'} />

      <Outlet />
    </>
  );
};

export default AppShell;
