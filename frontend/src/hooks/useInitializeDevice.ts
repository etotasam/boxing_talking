import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { DEVICE_BREAKPOINT } from '@/constants/deviceBreakpoint';
import { deviceState } from '@/store/deviceState';

export const useInitializeDevice = (): void => {
  const setDevice = useSetRecoilState(deviceState);

  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      const nextDevice = width > DEVICE_BREAKPOINT.pc ? 'PC' : 'SP';
      setDevice(nextDevice);
    };

    updateDevice();
    window.addEventListener('resize', updateDevice, false);

    return () => {
      window.removeEventListener('resize', updateDevice, false);
    };
  }, [setDevice]);
};
