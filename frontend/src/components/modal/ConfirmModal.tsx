import React from "react";

type Props = {
  message: string;
  okBtnString: string;
  cancel: <T>(arg?: T) => void;
  execution: <T>(arg?: T) => void;
};
export const ConfirmModal = ({ execution, message, okBtnString, cancel }: Props) => {
  return (
    <div
      onClick={cancel}
      className={`z-50 w-[100vw] h-[100vh] fixed top-0 left-0 flex justify-center items-center t-bgcolor-opacity-1`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="bg-white w-1/3 px-10 py-5 rounded flex flex-col justify-center items-center drop-shadow-lg"
      >
        <p dangerouslySetInnerHTML={{ __html: message }}></p>
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
