import { TailSpin } from "react-loader-spinner";

export const LoadingModal = () => {
  return (
    <div className="z-[999] fixed top-0 left-0 bg-black flex justify-center items-center w-[100vw] min-h-[100vh]">
      <div className="text-white">
        <h1 className="text-3xl text-center select-none">BOXING TALKING</h1>
        <div className="flex justify-center items-center mt-8">
          <TailSpin color="#ffffff" height="35" width="35" ariaLabel="loading" />
        </div>
      </div>
    </div>
  );
};
