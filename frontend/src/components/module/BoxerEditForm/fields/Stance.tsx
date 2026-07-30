import { LocalDataEntryType } from '@/page/Admin/BoxerEdit';
import { StanceType } from '@/types';
import { STANCE } from '@/constants/boxerData';

export const Stance = (props: { stance: StanceType; setBoxerFieldData: LocalDataEntryType }) => {
  const { stance, setBoxerFieldData } = props;
  return (
    <div className="mt-3 flex p-1">
      <label className="w-[100px] text-center" htmlFor="stance">
        スタイル:
      </label>
      <select
        className="w-[150px]"
        value={stance}
        onChange={(e) => setBoxerFieldData('style', e.target.value as StanceType)}
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
