import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { DEVICE_BREAKPOINT } from '@/constants/deviceBreakpoint';
import { isPcState } from '@/store/isPcState';

export const useInitializeDevice = (): void => {
  const setIsPc = useSetRecoilState(isPcState);

  useEffect(() => {
    const updateIsPc = () => {
      const width = window.innerWidth;
      setIsPc(width >= DEVICE_BREAKPOINT.pc);
    };

    updateIsPc();
    window.addEventListener('resize', updateIsPc, false);

    return () => {
      window.removeEventListener('resize', updateIsPc, false);
    };
  }, [setIsPc]);
};
