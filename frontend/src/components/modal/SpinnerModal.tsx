import { Oval } from "react-loader-spinner";

type Props = {
  className: string;
};

export const SpinnerModal = ({ className }: Partial<Props>) => {
  const style = className || "";
  return (
    <div
      className={`w-full h-full absolute top-0 left-0 flex justify-center items-center t-bgcolor-opacity-5 select-none  ${style}`}
    >
      <Oval color="#f0f0f0" width="25" />
    </div>
  );
};
