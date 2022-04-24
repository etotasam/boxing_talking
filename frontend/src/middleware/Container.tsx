import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { MessageModal } from "@/components/modal/MessageModal";
import { useMessageController } from "@/libs/hooks/messageController";
import { MESSAGE } from "@/libs/utils";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { AuthIs } from "@/store/slice/authUserSlice";

//! hooks
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";
import { useAuth } from "@/libs/hooks/useAuth";
import { useFetchUserVote } from "@/libs/hooks/useFetchUserVote";

//! component
import { LoadingModal } from "@/components/modal/LoadingModal";

const Container = () => {
  const { message, setMessageToModal } = useMessageController();
  const [msg, setMsg] = React.useState<MESSAGE>(MESSAGE.NULL);
  const [waitId, setWaitId] = React.useState<NodeJS.Timeout>();

  const { authState, authCheckAPI } = useAuth();
  const { matchesState, fetchAllMatches } = useFetchAllMatches();
  const { userVoteState, fetchUserVoteWithUserId } = useFetchUserVote();

  //? authチェックと試合情報の取得
  const [isDataLoading, setIsDataLoading] = useState(true);
  useEffect(() => {
    let auth;
    let matches;
    if (authState.hasAuth === AuthIs.UNDEFINED) {
      auth = authCheckAPI();
    }
    if (matchesState.matches === undefined) {
      matches = fetchAllMatches();
    }
    (async () => {
      await Promise.all([auth, matches]);
      setIsDataLoading(false);
    })();
  }, []);

  //? ログイン状態の場合はuserの選手への投票を取得する
  useEffect(() => {
    if (authState.hasAuth !== AuthIs.TRUE) return;
    fetchUserVoteWithUserId(authState.user.id);
  }, [authState.hasAuth]);

  //? メッセージモーダルのタイマーセット
  useEffect(() => {
    (async () => {
      if (waitId) {
        clearTimeout(waitId);
      }
      setMsg(message);
      await wait(3000);
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
      {isDataLoading && <LoadingModal />}
    </div>
  );
};

export default Container;
