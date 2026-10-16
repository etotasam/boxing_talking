import { atom } from 'recoil';

export const isPcState = atom<boolean>({
  key: 'isPcState',
  default: false,
});
