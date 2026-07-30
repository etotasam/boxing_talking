import { LocalDataEntryType } from '@/page/Admin/BoxerEdit';

export const Height = (props: { boxerHeight: number; setBoxerFieldData: LocalDataEntryType }) => {
  const { boxerHeight, setBoxerFieldData } = props;
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
        onChange={(e) => setBoxerFieldData('height', Number(e.target.value))}
      />
    </div>
  );
};
