import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { MessageModal } from "@/components/modal/MessageModal";
import { useMessageController } from "@/libs/hooks/messageController";
import { MESSAGE } from "@/libs/utils";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";

// hooks
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";

const AllComponentWrapper = () => {
  const { message, setMessageToModal } = useMessageController();
  const [msg, setMsg] = React.useState<MESSAGE>(MESSAGE.NULL);
  const [waitId, setWaitId] = React.useState<NodeJS.Timeout>();

  const { matchesState, fetchAllMatches } = useFetchAllMatches();

  // 試合情報の取得
  useEffect(() => {
    if (matchesState.matches === undefined) {
      fetchAllMatches();
    }
  }, []);

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
    </div>
  );
};

export default AllComponentWrapper;
