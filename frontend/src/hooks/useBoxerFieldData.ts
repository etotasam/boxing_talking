import { useSetRecoilState } from 'recoil';
import { boxerCurrentState } from '@/store/boxerCurrentState';
import { BoxerType } from '@/assets/types';

export const useBoxerFieldData = () => {
  const setBoxerCurrentData = useSetRecoilState(boxerCurrentState);

  const setBoxerFieldData = <K extends keyof BoxerType>(boxerDataKey: K, value: BoxerType[K]) => {
    setBoxerCurrentData((current) => ({
      ...current,
      [boxerDataKey]: value,
    }));
  };

  return { setBoxerFieldData };
};