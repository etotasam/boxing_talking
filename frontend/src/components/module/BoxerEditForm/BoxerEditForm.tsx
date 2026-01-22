//! type
import { BoxerType } from '@/assets/types';
import { LocalDataEntryType } from '@/page/Admin/BoxerEdit';
// ! component
import { Button } from '@/components/atomic/Button';
//! fields components
import { Name, Country, Birth, Height, Reach, Stance, BoxerResume, Titles } from './fields';

type PropsType = {
  boxerCurrentData: BoxerType;
  setBoxerFieldData: LocalDataEntryType;
  submitBoxerData: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending?: boolean;
  isSuccess?: boolean;
  isGuard?: boolean;
};

export const BoxerEditForm = (props: PropsType) => {
  const { boxerCurrentData, setBoxerFieldData, submitBoxerData } = props;

  return (
    <div className="p-10 bg-stone-200 border-stone-400 border-[1px]">
      <h1 className="text-3xl text-center">選手情報</h1>
      <form className="flex flex-col" onSubmit={submitBoxerData}>
        <Name
          boxerName={{ name: boxerCurrentData.name, engName: boxerCurrentData.engName }}
          setBoxerFieldData={setBoxerFieldData}
        />
        <Country boxersCountry={boxerCurrentData.country} setBoxerFieldData={setBoxerFieldData} />

        <Birth birth={boxerCurrentData.birth} setBoxerFieldData={setBoxerFieldData} />
        <Height boxerHeight={boxerCurrentData.height} setBoxerFieldData={setBoxerFieldData} />
        <Reach boxerReach={boxerCurrentData.reach} setBoxerFieldData={setBoxerFieldData} />
        <Stance stance={boxerCurrentData.style} setBoxerFieldData={setBoxerFieldData} />
        <BoxerResume
          resume={{
            win: boxerCurrentData.win,
            ko: boxerCurrentData.ko,
            draw: boxerCurrentData.draw,
            lose: boxerCurrentData.lose,
          }}
          setBoxerFieldData={setBoxerFieldData}
        />
        <Titles titles={boxerCurrentData.titles} setBoxerFieldData={setBoxerFieldData} />
        <div className="relative mt-5">
          <Button styleName={'wide'}>登録</Button>
        </div>
      </form>
    </div>
  );
};
