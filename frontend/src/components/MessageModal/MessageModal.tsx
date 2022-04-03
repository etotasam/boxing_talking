import React from "react";
import { useDispatch } from "react-redux";
import { setSuccessMessage } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";

export enum ModalBgColorType {
  ERROR = "red",
  SUCCESS = "green",
  DELETE = "gray",
}

export const MessageModal = ({
  message,
  errorMessage,
}: {
  message: string;
  errorMessage: ModalBgColorType | null;
}) => {
  const dispatch = useDispatch();
  const click = () => {
    dispatch(setSuccessMessage(MESSAGE.NULL));
  };
  const [bgColor, setBgColor] = React.useState<string>();
  React.useEffect(() => {
    switch (errorMessage) {
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
  }, [errorMessage]);
  return (
    <div
      onClick={click}
      className={`fixed top-[20px] left-[50%] translate-x-[-50%] py-2 text-center w-1/2 text-white rounded whitespace-pre-wrap ${bgColor}`}
    >
      {message}
    </div>
  );
};
