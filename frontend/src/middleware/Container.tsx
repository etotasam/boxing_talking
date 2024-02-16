import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ROUTE_PATH } from '@/assets/RoutePath';
// ! hooks
import { useGuest, useAuthCheck } from '@/hooks/apiHooks/useAuth';
import { useToastModal } from '@/hooks/useToastModal';
import { useFetchMatches } from '@/hooks/apiHooks/useMatch';
import { useLoginModal } from '@/hooks/useLoginModal';
import { useLoading } from '@/hooks/useLoading';
import { useFetchBoxers } from '@/hooks/apiHooks/useBoxer';
// ! modal
import { ToastModalContainer } from '@/components/modal/ToastModal';
import { LoginFormModal } from '@/components/modal/LoginFormModal';
import { FullScreenSpinnerModal } from '@/components/modal/FullScreenSpinnerModal';
import { FirstLoadingModal } from '@/components/modal/FirstLoadingModal';

const Container = () => {
  const { isShowToastModal, hideToastModal, messageOnToast } = useToastModal();
  const { isLoading: isAnyLoading } = useLoading();
  const { data: isAuth, isLoading: isFirstCheckingAuth } = useAuthCheck();
  const { data: guestUser } = useGuest();
  const { isLoading: isBoxersFetching, isRefetching: isRefetchingBoxers } =
    useFetchBoxers();
  const { isLoading: isMatchesFetching } = useFetchMatches();
  const navigate = useNavigate();
  const {
    state: isShowLoginModal,
    showLoginModal,
    hideLoginModal,
  } = useLoginModal();
  const { pathname } = useLocation();

  // ! Toast Modalの表示時間等の設定
  const waitTime = 5000;
  const waitId = React.useRef<NodeJS.Timeout>();
  //? メッセージモーダルのタイマーセット
  React.useEffect(() => {
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

  //? authコントロール
  useEffect(() => {
    if (isAuth === undefined || guestUser === undefined) return;
    if (!isAuth && !guestUser && pathname !== '/identification/') {
      showLoginModal();
      navigate(ROUTE_PATH.HOME);
    } else {
      hideLoginModal();
    }
  }, [isAuth, guestUser, pathname]);

  return (
    <>
      <Outlet />
      <AnimatePresence>
        {isShowToastModal && (
          <ToastModalContainer key={'ToastModalContainer'} />
        )}
        {(isAnyLoading || isRefetchingBoxers) && (
          <FullScreenSpinnerModal key={'FullScreenSpinnerModal'} />
        )}
        {(isFirstCheckingAuth || isBoxersFetching || isMatchesFetching) && (
          <FirstLoadingModal key={'FirstLoadingModal'} />
        )}
      </AnimatePresence>
      {isShowLoginModal && <LoginFormModal key={'LoginFormModal'} />}
    </>
  );
};

export default Container;
