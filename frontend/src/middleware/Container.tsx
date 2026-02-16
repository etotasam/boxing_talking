import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
// ! hooks
import { useGuest, useAuth } from '@/hooks/apiHooks/useAuth';
import { useToastModal } from '@/hooks/useToastModal';
import { useFetchMatches } from '@/hooks/apiHooks/useMatch';
import { useLoginModal } from '@/hooks/useLoginModal';
import { useFetchBoxers } from '@/hooks/apiHooks/useBoxer';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
// ! modal
import { ToastModalContainer } from '@/components/modal/ToastModal';
import { LoginFormModal } from '@/components/modal/LoginFormModal';
import { FullScreenSpinnerModal } from '@/components/modal/FullScreenSpinnerModal';
import { FirstLoadingModal } from '@/components/modal/FirstLoadingModal';
import { MenuModal } from '@/components/modal/MenuModal';

const Container = () => {
  const { isShowToastModal, hideToastModal, messageOnToast } = useToastModal();
  const { data: isAuth, isLoading: isFirstCheckingAuth } = useAuth();
  const { data: isGuest } = useGuest();
  const { isLoading: isBoxersFetching, isRefetching: isRefetchingBoxers } = useFetchBoxers();
  const { isLoading: isMatchesFetching } = useFetchMatches();
  const { isLoading: isFullScreenLoading } = useFullScreenLoading();
  const navigate = useNavigate();
  const { state: isShowLoginModal, showLoginModal, hideLoginModal } = useLoginModal();
  const { pathname } = useLocation();

  // ! Toast Modalの表示時間等の設定
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

  //? authコントロール
  useEffect(() => {
    const isAuthUndefined = isAuth === undefined || isGuest === undefined;
    if (isAuthUndefined) return;
    // const isShowLoginModalCondition = [!isAuth, !isGuest,pathname !== '/identification/'].every((condition) => condition);
    if (!isAuth && !isGuest && pathname !== '/identification/') {
      showLoginModal();
      navigate(ROUTE_PATH.HOME);
    } else {
      hideLoginModal();
    }
  }, [isAuth, isGuest, pathname]);

  const isShowFullScreenSpinnerCondition = isFullScreenLoading || isRefetchingBoxers;

  // const isShowFirstLoadingCondition = isFirstCheckingAuth || isBoxersFetching || isMatchesFetching;

  const isShowFirstLoadingCondition = [
    isFirstCheckingAuth,
    isBoxersFetching,
    isMatchesFetching,
  ].some((condition) => condition);

  return (
    <>
      <LoginFormModal isShow={isShowLoginModal} key={'LoginFormModal'} />
      <ToastModalContainer isShow={isShowToastModal} key={'ToastModalContainer'} />
      <FullScreenSpinnerModal
        isShow={isShowFullScreenSpinnerCondition}
        key={'FullScreenSpinnerModal'}
      />
      <FirstLoadingModal isShow={isShowFirstLoadingCondition} key={'FirstLoadingModal'} />
      <MenuModal />
      <Outlet />
    </>
  );
};

export default Container;
