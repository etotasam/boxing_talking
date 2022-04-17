import { Oval } from "react-loader-spinner";

type Props = {
  className: string;
};

const SpinnerModal = ({ className }: Partial<Props>) => {
  const style = className || "";
  return (
    <div
      className={`w-full h-full absolute top-0 left-0 flex justify-center items-center t-bgcolor-opacity-1  ${style}`}
    >
      <Oval color="#f0f0f0" width="25" />
    </div>
  );
};

export default SpinnerModal;
