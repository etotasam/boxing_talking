import { atom } from 'recoil';

export type DeviceStateType = 'PC' | 'SP';
export const deviceState = atom<DeviceStateType>({
  key: 'deviceState',
  default: 'SP',
});
