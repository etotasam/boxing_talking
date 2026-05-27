import { LocalDataEntryType } from '@/page/Admin/BoxerEdit';

export const Name = (props: {
  boxerName: { name: string; engName: string };
  setBoxerFieldData: LocalDataEntryType;
}) => {
  const { boxerName, setBoxerFieldData } = props;
  return (
    <>
      <input
        className="mt-3 px-1 rounded border-black"
        type="text"
        placeholder="名前(英字表示)"
        name="engName"
        value={boxerName.engName}
        onChange={
          (e) => setBoxerFieldData('engName', e.target.value)
        }
      />
      <input
        className="mt-3 px-1 rounded border-black"
        type="text"
        placeholder="選手名"
        name="name"
        value={boxerName.name}
        onChange={
          (e) => setBoxerFieldData('name', e.target.value)
        }
      />
    </>
  );
};
