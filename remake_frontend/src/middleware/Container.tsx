import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
// ! hooks
import { useAuth } from '@/hooks/useAuth';
import { useToastModal } from '@/hooks/useToastModal';
import { useFetchMatches } from '@/hooks/useMatch';
// import { useLoading } from "@/hooks/useLoading";
// ! modal
import { ToastModalContainer } from '@/components/modal/ToastModal';
import { LoginFormModal } from '@/components/modal/LoginFormModal';
import { FullScreenSpinnerModal } from '@/components/modal/FullScreenSpinnerModal';
import { FirstLoadinModal } from '@/components/modal/FirstLoadinModal';
// ! recoil
import { useRecoilValue } from 'recoil';
import { loginModalSelector } from '@/store/loginModalState';
import { loadingSelector } from '@/store/loadingState';
import { useFetchBoxer } from '@/hooks/useBoxer';

const Container = () => {
  const { isShowToastModal, hideToastModal, messageOnToast } = useToastModal();
  const isShowLoginModal = useRecoilValue(loginModalSelector);
  const { isLoading: isLoadingByRecoil } = useRecoilValue(loadingSelector);
  const { isLoading: isFirstCheckingAuth } = useAuth();
  const { isLoading: isBoxersFetching, isRefetching: isRefetchingBoxers } =
    useFetchBoxer();
  const { isLoading: isMatchesFetching } = useFetchMatches();

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
    </>
  );
};

export default Container;
