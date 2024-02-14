import clsx from 'clsx';
import { ComponentProps } from 'react';
import { useVisualModeController } from '@/hooks/useVisualModeController';
import { VISUAL_MODE } from '@/store/visualModeState';
//! icons
import { FaExchangeAlt } from 'react-icons/fa';

type PropsType = ComponentProps<'button'>;
export const VisualModeChangeButton = ({ onClick }: PropsType) => {
  const { state: visualMode } = useVisualModeController();
  return (
    <>
      <button
        onClick={onClick}
        className={clsx(
          'w-[40px] h-[40px] text-[18px] hover:text-[20px] rounded-[50%] duration-100 cursor-pointer bg-cyan-600/80 hover:bg-cyan-600/70'
        )}
      >
        <div
          className={clsx(
            'text-white absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] duration-300',
            visualMode === VISUAL_MODE.SIMPLE && 'scale-x-[-1]',
            visualMode === VISUAL_MODE.STANDARD && 'scale-x-1'
          )}
        >
          <FaExchangeAlt />
        </div>
      </button>
    </>
  );
};
