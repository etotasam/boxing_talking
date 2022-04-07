import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { MessageModal } from "@/components/MessageModal";
import { useMessageController } from "@/libs/hooks/messageController";
import { MESSAGE } from "@/libs/utils";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";

const AllComponentWrapper = () => {
  const { message, setMessageToModal } = useMessageController();
  const [msg, setMsg] = React.useState<MESSAGE>(MESSAGE.NULL);
  const [waitId, setWaitId] = React.useState<NodeJS.Timeout>();

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
    <div className="w-[100vw]">
      <Outlet />
      {msg !== MESSAGE.NULL && <MessageModal />}
    </div>
  );
};

export default AllComponentWrapper;
