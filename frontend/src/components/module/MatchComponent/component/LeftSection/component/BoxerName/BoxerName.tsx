import { MatchDataType, CountryType } from '@/assets/types';
import { FlagImage } from '@/components/atomic/FlagImage';

export const BoxerNameWrapper = ({ matchData }: { matchData: MatchDataType }) => {
  return (
    // <div className="z-[-20] bg-white relative h-[40px] mt-[10px]">
    //   <div className="z-[-10] absolute top-[-10px] w-full h-[60px] backdrop-blur-[2px] "></div>
    <div className="h-[40px] text-white flex justify-between items-center px-2">
      <BoxersNameBox matchData={matchData} />
    </div>
    // </div>
  );
};

const BoxersNameBox = ({ matchData }: { matchData: MatchDataType }) => {
  return (
    <>
      <div className="flex justify-center">
        <span className="pb-1">{matchData.redBoxer.name}</span>
        <CountryFlag country={matchData.redBoxer.country} />
      </div>
      <div className="flex justify-center">
        <CountryFlag country={matchData.blueBoxer.country} />
        <span className="pb-1">{matchData.blueBoxer.name}</span>
      </div>
    </>
  );
};

const CountryFlag = ({ country }: { country: CountryType }) => {
  return (
    <div className="flex items-center mx-1">
      <div className="relative flex justify-center overflow-hidden border-[1px] border-black/20 w-[18px] h-[18px] rounded-[50%]">
        <FlagImage
          nationality={country}
          className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[20px] h-[18px]"
        />
      </div>
    </div>
  );
};
