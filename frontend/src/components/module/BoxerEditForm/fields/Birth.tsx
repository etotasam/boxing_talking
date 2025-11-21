//! types
import { LocalDataEntryType } from '../BoxerEditForm';

export const Birth = (props: { birth: string; changeLocalBoxerData: LocalDataEntryType }) => {
  const { birth, changeLocalBoxerData } = props;
  return (
    <div className="flex mt-3">
      <label className="w-[100px] text-center" htmlFor="birth">
        生年月日
      </label>
      <input
        className="px-1 w-[150px]"
        type="date"
        id="birth"
        min="1970-01-01"
        value={birth}
        onChange={
          (e) => changeLocalBoxerData('birth', e.target.value)
          // setBoxerDataToForm((current: BoxerType) => {
          //   return { ...current, birth: e.target.value };
          // })
        }
      />
    </div>
  );
};
