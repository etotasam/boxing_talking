//! types
import { LocalDataEntryType } from '../BoxerEditForm';
import { StanceType } from '@/assets/types';
// ! data
import { STANCE } from '@/assets/boxerData';

export const Stance = (props: { stance: StanceType; changeLocalBoxerData: LocalDataEntryType }) => {
  const { stance, changeLocalBoxerData } = props;
  return (
    <div className="mt-3 flex p-1">
      <label className="w-[100px] text-center" htmlFor="stance">
        スタイル:
      </label>
      <select
        className="w-[150px]"
        value={stance}
        onChange={(e) => changeLocalBoxerData('style', e.target.value as StanceType)}
        name="boxing-style"
        id="stance"
      >
        <option value={STANCE.ORTHODOX}>{STANCE.ORTHODOX}</option>
        <option value={STANCE.SOUTHPAW}>{STANCE.SOUTHPAW}</option>
        <option value={STANCE.UNKNOWN}>{STANCE.UNKNOWN}</option>
      </select>
    </div>
  );
};
