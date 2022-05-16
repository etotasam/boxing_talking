import React from "react";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";

export const ToastModal = () => {
  // const { clearMessageOnModal, bgColor: bgColorType, message } = useMessageController();
  // const click = () => {
  //   clearMessageOnModal();
  // };
  const { setToastModalMessage, message, bgColor, clearToastModaleMessage } = useToastModal();

  const [color, setColor] = React.useState<string>();
  React.useEffect(() => {
    switch (bgColor) {
      case ModalBgColorType.ERROR:
        setColor("bg-red-600");
        break;
      case ModalBgColorType.SUCCESS:
        setColor("bg-green-600");
        break;
      case ModalBgColorType.DELETE:
        setColor("bg-gray-700");
        break;
      case ModalBgColorType.NOTICE:
        setColor("bg-blue-600");
        break;
      default:
        setColor("bg-gray-500");
    }
  }, [bgColor]);

  return (
    <div
      onClick={clearToastModaleMessage}
      className={`z-[100] fixed top-[20px] left-[50%] translate-x-[-50%] py-2 text-center w-1/2 text-white rounded whitespace-pre-wrap select-none ${color}`}
    >
      {message}
    </div>
  );
};
