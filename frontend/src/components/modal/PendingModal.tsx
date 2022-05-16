import React from "react";
import { RotatingLines } from "react-loader-spinner";

type Props = {
  message?: string;
  pending?: boolean;
};
export const PendingModal = ({ message = "データ取得中..." }: Props) => {
  return (
    <div
      className={`z-50 w-[100vw] h-[100vh] fixed top-0 left-0 flex justify-center items-center t-bgcolor-opacity-1`}
    >
      <div className="bg-white w-1/3 px-10 py-5 rounded flex flex-col justify-center items-center drop-shadow-lg">
        <p>{message}</p>
        <div className="pt-3">
          <RotatingLines strokeColor="#151515" strokeWidth="3" animationDuration="1" width="30" />
        </div>
      </div>
    </div>
  );
};
