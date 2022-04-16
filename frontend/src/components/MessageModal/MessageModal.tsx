import React from "react";
import { useMessageController } from "@/libs/hooks/messageController";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";

export const MessageModal = () => {
  const { clearMessageOnModal, bgColor: bgColorType, message } = useMessageController();
  const click = () => {
    clearMessageOnModal();
  };
  const [bgColor, setBgColor] = React.useState<string>();
  React.useEffect(() => {
    switch (bgColorType) {
      case ModalBgColorType.ERROR:
        setBgColor("bg-red-600");
        break;
      case ModalBgColorType.SUCCESS:
        setBgColor("bg-green-400");
        break;
      case ModalBgColorType.DELETE:
        setBgColor("bg-gray-700");
        break;
      default:
        setBgColor("bg-gray-500");
    }
  }, [bgColorType]);
  return (
    <div
      onClick={click}
      className={`fixed top-[20px] left-[50%] translate-x-[-50%] py-2 text-center w-1/2 text-white rounded whitespace-pre-wrap ${bgColor}`}
    >
      {message}
    </div>
  );
};
