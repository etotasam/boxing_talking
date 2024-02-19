import { Button } from '@/components/atomic/Button';
import { InfoModal } from '../InfoModal';
import { FlagImage } from '@/components/atomic/FlagImage';
import { RiCloseLine } from 'react-icons/ri';
import { CountryType } from '@/assets/types';
import clsx from 'clsx';
// ! image
import crown from '@/assets/images/etc/champion.svg';

type BoxersDataType = {
  red: {
    name: string;
    country: CountryType;
    title: number;
  };
  blue: {
    name: string;
    country: CountryType;
    title: number;
  };
};

type PredictionVoteModalType = {
  boxersData: BoxersDataType;
  voteExecution: (color: 'red' | 'blue') => void;
  close: () => void;
};
export const PredictionVoteModal = ({
  boxersData,
  voteExecution,
  close,
}: PredictionVoteModalType) => {
  return (
    <InfoModal>
      <div className="relative px-10 pt-2 pb-5 min-w-[350px]">
        <h2 className="text-center text-stone-600 font-bold text-lg tracking-widest">
          勝者は？
        </h2>
        <div className="mt-5 w-full">
          <div className="w-full flex justify-center">
            <BoxerButton
              boxerData={boxersData.red}
              onClick={() => voteExecution('red')}
            />
          </div>

          <div className="w-full flex justify-center mt-7">
            <BoxerButton
              boxerData={boxersData.blue}
              onClick={() => voteExecution('blue')}
            />
          </div>
        </div>

        {/* <div className="mt-5 flex justify-center items-center">
            <button
              onClick={close}
              className="max-w-[500px] w-full  bg-stone-600 text-white  py-1 rounded-sm"
            >
              わからない
            </button>
          </div> */}
      </div>
      <RiCloseLine
        onClick={close}
        className="absolute top-[3px] right-[3px] text-stone-600 font-bold text-[25px] cursor-pointer"
      />
    </InfoModal>
  );
};

type BoxerButtonType = {
  boxerData: { name: string; country: CountryType; title: number };
  onClick: () => void;
};
const BoxerButton = ({ onClick, boxerData }: BoxerButtonType) => {
  const fullName = boxerData.name;
  let targetName: string | null = null;
  if (fullName.includes('・') && fullName.length > 10) {
    const parts = fullName.split('・');
    targetName = parts[parts.length - 1];
  }

  return (
    <Button
      onClick={onClick}
      styleName="wide"
      // className="px-5 py-1 bg-stone-700 text-white whitespace-nowrap"
    >
      <div className={clsx('flex items-center justify-center px-5')}>
        <span className="relative flex justify-center overflow-hidden w-[18px] h-[18px] rounded-[50%] mr-2">
          <FlagImage
            className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full"
            nationality={boxerData.country}
          />
        </span>
        {targetName ?? boxerData.name}
        {[...Array(boxerData.title)].map((_, i) => (
          <CrowImg key={`${boxerData.name}${i}`} />
        ))}
      </div>
    </Button>
  );
};

const CrowImg = () => {
  return <img className="w-[18px] h-[18px] ml-1" src={crown} alt="" />;
};
