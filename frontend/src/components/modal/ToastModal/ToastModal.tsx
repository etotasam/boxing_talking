import React from "react";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";

export const ToastModal = () => {
  const { message, bgColor, clearToastModaleMessage } = useToastModal();

  const [color, setColor] = React.useState<string>();
  React.useEffect(() => {
    switch (bgColor) {
      case ModalBgColorType.ERROR:
        setColor("bg-red-700");
        break;
      case ModalBgColorType.SUCCESS:
        setColor("bg-green-600");
        break;
      case ModalBgColorType.DELETE:
        setColor("bg-stone-700");
        break;
      case ModalBgColorType.NOTICE:
        setColor("bg-blue-600");
        break;
      case ModalBgColorType.GRAY:
        setColor("bg-stone-600");
        break;
      default:
        setColor("bg-gray-500");
    }
  }, [bgColor]);

  return (
    <div
      onClick={clearToastModaleMessage}
      className={`z-[999] fixed top-[90vh] md:top-[20px] left-[50%] translate-x-[-50%] py-2 px-5 min-w-[80%] md:min-w-[30%] text-center text-white rounded whitespace-pre-wrap select-none ${color}`}
    >
      {message}
    </div>
  );
};
