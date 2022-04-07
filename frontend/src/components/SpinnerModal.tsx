import { RotatingLines } from "react-loader-spinner";

type Props = {
  className: string;
};

const SpinnerModal = ({ className }: Partial<Props>) => {
  const style = className || "";
  return (
    <div
      className={`w-full h-full absolute top-0 left-0 flex justify-center items-center t-bgcolor-opacity-1  ${style}`}
    >
      <RotatingLines
        strokeColor="#4d4d4d"
        strokeWidth="3"
        animationDuration="1"
        width="30"
      />
    </div>
  );
};

export default SpinnerModal;
