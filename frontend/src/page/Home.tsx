//! layout
import HeaderAndFooterLayout from '@/layout/HeaderAndFooterLayout';
// ! components
import { Matches } from '@/components/module/Matches';
//! icon
import { VisualModeChangeButton } from '@/components/atomic/VisualModeChangeButton';
// ! hooks
import { useWindowSize } from '@/hooks/useWindowSize';
import { useVisualModeController } from '@/hooks/useVisualModeController';

export const Home = () => {
  const { device } = useWindowSize();

  const { visualModeToggleSwitch } = useVisualModeController();

  return (
    <>
      {/* {device == 'PC' && (
        <div className="z-10 fixed top-[100px] lg:right-10 md:right-5 right-2">
          <VisualModeChangeButton onClick={() => visualModeToggleSwitch()} />
        </div>
      )} */}

      <HeaderAndFooterLayout>
        <Matches />
      </HeaderAndFooterLayout>
    </>
  );
};
