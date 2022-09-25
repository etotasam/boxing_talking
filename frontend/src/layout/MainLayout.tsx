import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
// import { MessageModal } from "@/components/modal/MessageModal";
import { ToastModal } from "@/components/modal/ToastModal";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "react-query";
//! hooks
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useAuth } from "@/libs/hooks/useAuth";
import { useToastModal } from "@/libs/hooks/useToastModal";
import { queryKeys } from "@/libs/queryKeys";
import { useQueryState } from "@/libs/hooks/useQueryState";
import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";
//! component
import { LoadingModal } from "@/components/modal/LoadingModal";
import { ClearModal } from "@/components/modal/ClearModal";
import { SignUpModal } from "@/components/modal/SignUpModal";
import { LoginModal } from "@/components/modal/LoginModal";
import { Header } from "@/components/module/Header";

const MainLayout = React.memo(() => {
  const queryClient = useQueryClient();
  const { clearToastModaleMessage, isOpenToastModal } = useToastModal();
  // const { message, setMessageToModal } = useMessageController();
  // const [msg, setMsg] = React.useState<MESSAGE>(MESSAGE.NULL);
  const [waitId, setWaitId] = React.useState<NodeJS.Timeout>();

  // const { data: authUser, isLoading: isCheckingAuth, isError } = useAuth();
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
  //? コメント削除のpending状態
  const { state: isPendingCommentDelete } = useQueryState("q/isCommentDeleting");
  //? コメント投稿中の状態
  const { state: isCommentPosting } = useQueryState("q/isCommentPosting");

  //? ClearModalが表示される条件
  const pending =
    isPendingVote ||
    isPendingLogin ||
    isPendingLogout ||
    isPendingCommentDelete ||
    isCommentPosting;

  //? cookieでログインチェック。なければfalseを入れる
  // useEffect(() => {
  //   if (!isError) return;
  //   queryClient.setQueryData(queryKeys.auth, false);
  // }, [isError]);

  //? メッセージモーダルのタイマーセット
  useEffect(() => {
    if (!isOpenToastModal) {
      clearToastModaleMessage();
    }
    (async () => {
      if (waitId) {
        clearTimeout(waitId);
      }
      await wait(5000);
      clearToastModaleMessage();
    })();
  }, [isOpenToastModal]);

  const wait = (ms: number) => {
    return new Promise((resolve) => {
      const id: NodeJS.Timeout = setTimeout(resolve, ms);
      setWaitId(id);
    });
  };

  const { width: windowWidth } = useGetWindowSize();

  return (
    <div className="bg-stone-200">
      <Header />
      <main className={`min-h-[calc(100vh-50px)] pt-[100px] mx-auto max-w-[1024px]`}>
        <Outlet />
      </main>
      <footer className="h-[50px] bg-stone-200 border-t border-stone-300 text-center">
        ©footer
      </footer>
      {/* 以下 modal */}
      <AnimatePresence>
        {isOpenToastModal && (
          <motion.div>
            <ToastModal windowWidth={windowWidth} />
          </motion.div>
        )}
      </AnimatePresence>
      {isFetchingMatches && <LoadingModal />}
      {isOpenSignUpModal && <SignUpModal />}
      {isOpenLoginModal && <LoginModal />}
      {pending && <ClearModal />}
    </div>
  );
});

export default MainLayout;
