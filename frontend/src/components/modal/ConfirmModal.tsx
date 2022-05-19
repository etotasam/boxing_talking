import React from "react";

type Props = {
  message: string | JSX.Element;
  okBtnString: string;
  cancel: <T>(arg?: T) => void;
  execution: <T>(arg?: T) => void;
};
export const ConfirmModal = ({ execution, message, okBtnString, cancel }: Props) => {
  return (
    <div
      onClick={cancel}
      className={`z-50 w-[100vw] h-[100vh] fixed top-0 left-0 flex justify-center items-center bg-black/10`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="bg-stone-100 w-1/3 max-w-[500px] min-w-[350px] px-10 py-5 rounded flex flex-col justify-center items-center drop-shadow-lg"
      >
        <div className="text-center w-full">{message}</div>
        <div className="flex mt-5">
          <button
            onClick={cancel}
            className="px-2 py-1 bg-stone-500 hover:bg-stone-700 duration-300 text-white rounded"
          >
            キャンセル
          </button>
          <button
            onClick={execution}
            className="px-2 py-1 bg-green-500 hover:bg-green-700 duration-300 text-white rounded ml-10"
          >
            {okBtnString}
          </button>
        </div>
      </div>
    </div>
  );
};
