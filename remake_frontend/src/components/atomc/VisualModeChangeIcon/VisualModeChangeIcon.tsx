import { ComponentProps } from 'react';
import { PiShuffleSimpleBold } from 'react-icons/pi';

type PropsType = ComponentProps<'button'>;
export const VisualModeChangeIcon = ({ onClick }: PropsType) => {
  return (
    <>
      <button
        onClick={onClick}
        className="w-[40px] h-[40px] rounded-[50%] bg-cyan-600/80 hover:bg-cyan-600 duration-300 relative after:absolute after:bottom-[-10px] after:left-[50%] after:translate-x-[-50%] after:text-stone-600 after:content-['VisualMode'] after:text-[12px] cursor-pointer"
      >
        <div className="text-[18px] text-white absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          <PiShuffleSimpleBold />
        </div>
      </button>
    </>
  );
};
