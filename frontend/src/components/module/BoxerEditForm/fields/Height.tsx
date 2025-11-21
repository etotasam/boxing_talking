//! types
import { LocalDataEntryType } from '../BoxerEditForm';

export const Height = (props: {
  boxerHeight: number;
  changeLocalBoxerData: LocalDataEntryType;
}) => {
  const { boxerHeight, changeLocalBoxerData } = props;
  return (
    <div className="mt-3 flex p-1">
      <label className="w-[100px] text-center" htmlFor="height">
        身長
      </label>
      <input
        id="height"
        className="px-1 w-[150px]"
        type="number"
        min="0"
        value={boxerHeight}
        onChange={(e) => changeLocalBoxerData('height', Number(e.target.value))}
      />
    </div>
  );
};
