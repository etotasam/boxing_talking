import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
// ! hooks
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useFetchBoxers } from '@/hooks/apiHooks/useBoxer';
import { useAuth } from '@/hooks/apiHooks/useAuth';
import { useFetchMatches } from '@/hooks/apiHooks/useMatch';
import { useToastModal } from '@/hooks/useToastModal';
// ! modal
import { FirstLoadingModal } from '@/components/modal/FirstLoadingModal';
import { FullScreenSpinnerModal } from '@/components/modal/FullScreenSpinnerModal';
import { ToastModal } from '@/components/modal/ToastModal';

const RootLayout = () => {
  const { isLoading: isFullScreenLoading } = useFullScreenLoading();
  const { isLoading: isBoxersFetching, isRefetching: isRefetchingBoxers } = useFetchBoxers();
  const isShowFullScreenSpinnerCondition = isFullScreenLoading || isRefetchingBoxers;

  const { isLoading: isFirstCheckingAuth } = useAuth();
  const { isLoading: isMatchesFetching } = useFetchMatches();

  const isShowFirstLoadingCondition = [
    isFirstCheckingAuth,
    isBoxersFetching,
    isMatchesFetching,
  ].some((condition) => condition);

  // ! Toast Modalの表示時間等の設定
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

export default RootLayout;
