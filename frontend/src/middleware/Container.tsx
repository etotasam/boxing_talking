import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { MessageModal } from "@/components/modal/MessageModal";
import { useMessageController } from "@/libs/hooks/messageController";
import { MESSAGE } from "@/libs/utils";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { AuthIs } from "@/store/slice/authUserSlice";

//! hooks
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useAuth } from "@/libs/hooks/useAuth";
import { useFetchUserVote } from "@/libs/hooks/useFetchUserVote";

//! component
import { LoadingModal } from "@/components/modal/LoadingModal";

const Container = () => {
  const { message, setMessageToModal } = useMessageController();
  const [msg, setMsg] = React.useState<MESSAGE>(MESSAGE.NULL);
  const [waitId, setWaitId] = React.useState<NodeJS.Timeout>();

  const { data: authUser, isLoading: isCheckingAuth } = useAuth();
  const { isLoading: isFetchingMatches } = useFetchMatches();
  const { userVoteState, fetchUserVoteWithUserId } = useFetchUserVote();

  //? ログイン状態の場合はuserの選手への投票を取得する
  useEffect(() => {
    if (!authUser) return;
    fetchUserVoteWithUserId(authUser.id);
  }, [authUser]);

  //? メッセージモーダルのタイマーセット
  useEffect(() => {
    (async () => {
      if (waitId) {
        clearTimeout(waitId);
      }
      setMsg(message);
      await wait(5000);
      setMsg(MESSAGE.NULL);
      setMessageToModal(MESSAGE.NULL, ModalBgColorType.NULL);
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
      {msg !== MESSAGE.NULL && <MessageModal />}
      {(isCheckingAuth || isFetchingMatches) && <LoadingModal />}
    </div>
  );
};

export default Container;
