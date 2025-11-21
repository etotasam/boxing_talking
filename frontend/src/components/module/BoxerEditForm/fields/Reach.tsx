//! types
import { LocalDataEntryType } from '../BoxerEditForm';

export const Reach = (props: { boxerReach: number; changeLocalBoxerData: LocalDataEntryType }) => {
  const { boxerReach, changeLocalBoxerData } = props;
  return (
    <div className="mt-3 flex p-1">
      <label className="w-[100px] text-center" htmlFor="height">
        リーチ
      </label>
      <input
        id="reach"
        className="px-1 w-[150px]"
        type="number"
        min="0"
        value={boxerReach}
        onChange={(e) => changeLocalBoxerData('reach', Number(e.target.value))}
      />
    </div>
  );
};
