import React from "react";
import { Outlet } from "react-router-dom";
//! hooks
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useQueryState } from "@/libs/hooks/useQueryState";
//! component
import { LoadingModal } from "@/components/modal/LoadingModal";
import { ClearModal } from "@/components/modal/ClearModal";
import { SignUpModal } from "@/components/modal/SignUpModal";
import { LoginModal } from "@/components/modal/LoginModal";
import { Header } from "@/components/module/Header";
import { Footer } from "@/components/module/Footer";
import { ShutterModal } from "@/components/modal/ShutterModal";

const MainLayout = React.memo(() => {
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

  return (
    <div className="bg-stone-200">
      <Header />
      <main className={`min-h-[calc(100vh-50px)] pt-[100px] mx-auto max-w-[1024px]`}>
        <Outlet />
      </main>
      <Footer />
      {isFetchingMatches && <LoadingModal />}
      {isOpenSignUpModal && <SignUpModal />}
      {isOpenLoginModal && <LoginModal />}
      {pending && <ClearModal />}
      {/* <ShutterModal /> */}
    </div>
  );
});

export default MainLayout;
