import { Oval } from "react-loader-spinner";
import { RotatingLines } from "react-loader-spinner";

type Props = {
  className: string;
};

export const SpinnerModal = ({ className }: Partial<Props>) => {
  const style = className || "";
  return (
    <div
      className={`w-full h-full absolute top-0 left-0 flex justify-center items-center t-bgcolor-white-opacity-5 select-none  ${style}`}
    >
      <RotatingLines strokeColor="#151515" strokeWidth="3" animationDuration="1" width="30" />
      {/* <Oval color="#f0f0f0" width="25" /> */}
    </div>
  );
};
