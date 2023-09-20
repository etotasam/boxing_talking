import { ComponentProps } from 'react';
import { PiShuffleSimpleBold } from 'react-icons/pi';

type PropsType = ComponentProps<'button'>;
export const VisualModeChangeIcon = ({ onClick }: PropsType) => {
  return (
    <>
      <button
        onClick={onClick}
        className="w-[40px] h-[40px] text-[18px] hover:text-[20px] rounded-[50%] bg-cyan-600/80 hover:bg-cyan-600 duration-300 after:duration-300 relative after:absolute after:bottom-[-14px] after:left-[50%] after:text-transparent hover:after:text-black/70 after:translate-x-[-50%] after:content-['VisualMode'] after:text-[12px] cursor-pointer"
      >
        <div className="text-white absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          <PiShuffleSimpleBold />
        </div>
      </button>
    </>
  );
};
