import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
// ! hooks
import { useGuest, useAuthCheck } from '@/hooks/useAuth';
import { useToastModal } from '@/hooks/useToastModal';
import { useFetchMatches } from '@/hooks/useMatch';
import { useAdmin } from '@/hooks/useAuth';
// import { useLoading } from "@/hooks/useLoading";
// ! modal
import { ToastModalContainer } from '@/components/modal/ToastModal';
import { LoginFormModal } from '@/components/modal/LoginFormModal';
import { FullScreenSpinnerModal } from '@/components/modal/FullScreenSpinnerModal';
import { FirstLoadinModal } from '@/components/modal/FirstLoadinModal';
import { useLoginModal } from '@/hooks/useLoginModal';
// ! recoil
import { useRecoilValue } from 'recoil';
import { loginModalSelector } from '@/store/loginModalState';
import { loadingSelector } from '@/store/loadingState';
import { useFetchBoxer } from '@/hooks/useBoxer';
//! component
import { LinkList } from '@/components/module/LinkList';

const Container = () => {
  const { isAdmin } = useAdmin();
  const { isShowToastModal, hideToastModal, messageOnToast } = useToastModal();
  const isShowLoginModal = useRecoilValue(loginModalSelector);
  const { isLoading: isLoadingByRecoil } = useRecoilValue(loadingSelector);
  const { data: isAuth, isLoading: isFirstCheckingAuth } = useAuthCheck();
  const { data: guestUser } = useGuest();
  const { isLoading: isBoxersFetching, isRefetching: isRefetchingBoxers } =
    useFetchBoxer();
  const { isLoading: isMatchesFetching } = useFetchMatches();
  const navigate = useNavigate();
  const { showLoginModal, hideLoginModal } = useLoginModal();

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

  useEffect(() => {
    if (isAuth === undefined || guestUser === undefined) return;
    if (!isAuth && !guestUser) {
      showLoginModal();
      navigate('/');
    } else {
      hideLoginModal();
    }
  }, [isAuth, guestUser]);

  return (
    <>
      <Outlet />
      <AnimatePresence>
        {isShowToastModal && (
          <ToastModalContainer key={'ToastModalContainer'} />
        )}
        {(isLoadingByRecoil || isRefetchingBoxers) && (
          <FullScreenSpinnerModal key={'FullScreenSpinnerModal'} />
        )}
        {(isFirstCheckingAuth || isBoxersFetching || isMatchesFetching) && (
          <FirstLoadinModal key={'FirstLoadinModal'} />
        )}
      </AnimatePresence>
      {isShowLoginModal && <LoginFormModal key={'LoginFormModal'} />}
      {/* // ? 管理者用 */}
      {isAdmin && (
        <div className="fixed right-[200px] top-0">
          <LinkList />
        </div>
      )}
    </>
  );
};

export default Container;
