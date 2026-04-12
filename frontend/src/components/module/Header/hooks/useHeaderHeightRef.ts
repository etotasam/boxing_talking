import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { DeviceStateType } from '@/store/deviceState';

export const useHeaderHeightRef = (device: DeviceStateType) => {
  const setHeaderHeight = useSetRecoilState(elementSizeState('HEADER_HEIGHT'));

  return useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        setHeaderHeight(node.clientHeight);
      }
    },
    [device, setHeaderHeight]
  );
};
