import React from "react";
import { RotatingLines } from "react-loader-spinner";

export const FullScreenSpinnerModal = () => {
  React.useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);
  return (
    <div
      className={`z-50 w-[100vw] h-[100vh] fixed top-0 left-0 flex justify-center items-center bg-black/30`}
    >
      <RotatingLines
        strokeColor="#f1f1f1"
        strokeWidth="3"
        animationDuration="1"
        width="60"
      />
    </div>
  );
};
