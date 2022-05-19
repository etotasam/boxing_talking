import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
// import { MessageModal } from "@/components/modal/MessageModal";
import { ToastModal } from "@/components/modal/ToastModal";
import { MESSAGE } from "@/libs/utils";
import { useQueryClient } from "react-query";
//! hooks
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useAuth } from "@/libs/hooks/useAuth";
import { useFetchUserVote } from "@/libs/hooks/useFetchUserVote";
import { useToastModal } from "@/libs/hooks/useToastModal";
import { queryKeys } from "@/libs/queryKeys";
import { useQueryState } from "@/libs/hooks/useQueryState";

//! component
import { LoadingModal } from "@/components/modal/LoadingModal";
import { ClearModal } from "@/components/modal/ClearModal";
import { SignUpModal } from "@/components/modal/SignUpModal";
import { LoginModal } from "@/components/modal/LoginModal";

const Container = React.memo(() => {
  const queryClient = useQueryClient();
  const { message, setToastModalMessage, clearToastModaleMessage } = useToastModal();
  // const { message, setMessageToModal } = useMessageController();
  const [msg, setMsg] = React.useState<MESSAGE>(MESSAGE.NULL);
  const [waitId, setWaitId] = React.useState<NodeJS.Timeout>();

  const { data: authUser, isLoading: isCheckingAuth, isError } = useAuth();
  const { isLoading: isFetchingMatches } = useFetchMatches();

  //? アカウント作成モーダルの状態管理cache
  const { state: isOpenSignUpModal } = useQueryState<boolean>("q/isOpenSignUpModal");
  //? ログイン実行中...
  const { state: isPendingLogin } = useQueryState<boolean>("q/isPendingLogin");
  //? ログアウト実行中...
  const { state: isPendingLogout } = useQueryState<boolean>("q/isPendingLogout");
  //? 試合予想の投票実行中...
  const { state: isPendingVote } = useQueryState<boolean>("q/isPendingVote");
  //? loginモーダルの状態管理
  const { state: isOpenLoginModal } = useQueryState<boolean>("q/isOpenLoginModal");

  //? ClearModalが表示される条件
  const pending = isPendingVote || isPendingLogin || isPendingLogout;

  //? cookieでログインチェック。なければfalseを入れる
  useEffect(() => {
    if (!isError) return;
    queryClient.setQueryData(queryKeys.auth, false);
  }, [isError]);

  //? メッセージモーダルのタイマーセット
  useEffect(() => {
    if (!message) {
      clearToastModaleMessage();
    }
    (async () => {
      if (waitId) {
        clearTimeout(waitId);
      }
      setMsg(message);
      await wait(5000);
      setMsg(MESSAGE.NULL);
      clearToastModaleMessage();
      // setMessageToModal(MESSAGE.NULL, ModalBgColorType.NULL);
    })();
  }, [message]);

  const wait = (ms: number) => {
    return new Promise((resolve) => {
      const id: NodeJS.Timeout = setTimeout(resolve, ms);
      setWaitId(id);
    });
  };
  return (
    <div className="relative w-full">
      <Outlet />
      {msg !== MESSAGE.NULL && <ToastModal />}
      {(isCheckingAuth || isFetchingMatches) && <LoadingModal />}
      {isOpenSignUpModal && <SignUpModal />}
      {isOpenLoginModal && <LoginModal />}
      {pending && <ClearModal />}
    </div>
  );
});

export default Container;
