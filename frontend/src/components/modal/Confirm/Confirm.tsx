import React from "react";

type PropsType = React.ComponentProps<"div"> & AnyType;

type AnyType = {
  execution: () => void;
  cancel: () => void;
};

export const Confirm = ({ children, execution, cancel }: PropsType) => {
  return (
    <div className="z-20 fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center overflow-hidden">
      <div className="bg-white rounded-md py-5 px-5 min-w-[300px]">
        <p className="my-5 w-full text-center">{children}</p>
        <div className="flex justify-between">
          <button
            onClick={execution}
            className="bg-red-500 text-white py-1 px-5 rounded-md"
          >
            実行
          </button>
          <button
            onClick={cancel}
            className="bg-stone-500 text-white py-1 px-5 rounded-md"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};
