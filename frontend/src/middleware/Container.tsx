import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
// import { MessageModal } from "@/components/modal/MessageModal";
import { ToastModal } from "@/components/modal/ToastModal";
import { MESSAGE } from "@/libs/utils";

//! hooks
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useAuth } from "@/libs/hooks/useAuth";
import { useFetchUserVote } from "@/libs/hooks/useFetchUserVote";
import { useToastModal } from "@/libs/hooks/useToastModal";

//! component
import { LoadingModal } from "@/components/modal/LoadingModal";

const Container = React.memo(() => {
  const { message, setToastModalMessage, clearToastModaleMessage } = useToastModal();
  // const { message, setMessageToModal } = useMessageController();
  const [msg, setMsg] = React.useState<MESSAGE>(MESSAGE.NULL);
  const [waitId, setWaitId] = React.useState<NodeJS.Timeout>();

  const { data: authUser, isLoading: isCheckingAuth } = useAuth();
  const { isLoading: isFetchingMatches } = useFetchMatches();
  // const { userVoteState, fetchUserVoteWithUserId } = useFetchUserVote();

  //? ログイン状態の場合はuserの選手への投票を取得する
  // useEffect(() => {
  //   if (!authUser) return;
  //   fetchUserVoteWithUserId(authUser.id);
  // }, [authUser]);

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
    <div className="w-full">
      <Outlet />
      {msg !== MESSAGE.NULL && <ToastModal />}
      {(isCheckingAuth || isFetchingMatches) && <LoadingModal />}
    </div>
  );
});

export default Container;
