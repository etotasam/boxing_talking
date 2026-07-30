import { LocalDataEntryType } from '@/page/Admin/BoxerEdit';

export const Reach = (props: { boxerReach: number; setBoxerFieldData: LocalDataEntryType }) => {
  const { boxerReach, setBoxerFieldData } = props;
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
        onChange={(e) => setBoxerFieldData('reach', Number(e.target.value))}
      />
    </div>
  );
};
