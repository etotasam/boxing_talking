import React from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
// ! hooks
import { useAuth } from "@/hooks/useAuth";
import { useToastModal } from "@/hooks/useToastModal";
// ! modal
import { ToastModalContainer } from "@/components/modal/ToastModal";
import { LoginFormModal } from "@/components/modal/LoginFormModal";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";
import { FirstLoadinModal } from "@/components/modal/FirstLoadinModal";
// ! recoil
import { useRecoilValue } from "recoil";
import { loginModalSelector } from "@/store/loginModalState";
import { loadingSelector } from "@/store/loadingState";

const Container = () => {
  const { isShowToastModal, hideToastModal, messageOnToast } = useToastModal();
  const isShowLoginModal = useRecoilValue(loginModalSelector);
  const { isLoading: isAttemptingLogin } = useRecoilValue(loadingSelector);

  const { data: userData, isError, isLoading: isFirstCheckingAuth } = useAuth();

  //? cookieでログインチェック。なければfalseを入れる
  React.useEffect(() => {
    if (!isError) return;
  }, [isError]);

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
      <Modales
        isShowToastModal={isShowToastModal}
        isShowLoginModal={isShowLoginModal}
        isAttemptingLogin={isAttemptingLogin}
        isFirstCheckingAuth={isFirstCheckingAuth}
      />
    </>
  );
};

export default Container;

type ModalesData = {
  isShowToastModal: boolean;
  isShowLoginModal: boolean;
  isAttemptingLogin: boolean | undefined;
  isFirstCheckingAuth: boolean;
};

/**
 *  モーダル
 *  @param {modaleData} 必要データ
 *  @returns {ReactNode}
 */
const Modales = (props: ModalesData) => {
  return (
    <>
      <AnimatePresence>
        {props.isShowToastModal && <ToastModalContainer />}
        {props.isFirstCheckingAuth && <FirstLoadinModal />}
      </AnimatePresence>
      {props.isShowLoginModal && <LoginFormModal />}
      {props.isAttemptingLogin && <FullScreenSpinnerModal />}
    </>
  );
};
