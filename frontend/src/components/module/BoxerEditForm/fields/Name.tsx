//! types
import { LocalDataEntryType } from '../BoxerEditForm';

export const Name = (props: {
  boxerName: { name: string; engName: string };
  changeLocalBoxerData: LocalDataEntryType;
}) => {
  const { boxerName, changeLocalBoxerData } = props;
  return (
    <>
      <input
        className="mt-3 px-1 rounded border-black"
        type="text"
        placeholder="名前(英字表示)"
        name="engName"
        value={boxerName.engName}
        onChange={
          (e) => changeLocalBoxerData('engName', e.target.value)
          // setBoxerDataToForm((current: BoxerType) => {
          //   return { ...current, engName: e.target.value };
          // })
        }
      />
      <input
        className="mt-3 px-1 rounded border-black"
        type="text"
        placeholder="選手名"
        name="name"
        value={boxerName.name}
        onChange={
          (e) => changeLocalBoxerData('name', e.target.value)
          // setBoxerDataToForm((current: BoxerType) => {
          //   return { ...current, name: e.target.value };
          // })
        }
      />
    </>
  );
};
