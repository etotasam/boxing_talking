import clsx from 'clsx';
import { useRecoilValue } from 'recoil';
//! type
import { MatchDataType } from '@/types';
//! recoil
import { deviceState } from '@/store/deviceState';
//! components
import { BoxerInfo } from './BoxerInfo';

type BoxersDataProps = {
  matchData: MatchDataType;
};

export const BoxersData = ({ matchData }: BoxersDataProps) => {
  const device = useRecoilValue(deviceState);
  return (
    <div className={clsx('text-white relative flex justify-between w-full max-w-[1024px]')}>
      <div className={`${device === 'PC' ? 'w-[45%]' : 'w-[50%]'}`}>
        <BoxerInfo
          boxer={{ ...matchData.redBoxer, color: 'red' }}
          matchResult={matchData.result}
          matchDate={matchData.matchDate}
        />
      </div>

      <div className={`${device === 'PC' ? 'w-[45%]' : 'w-[50%]'}`}>
        <BoxerInfo
          boxer={{ ...matchData.blueBoxer, color: 'blue' }}
          matchResult={matchData.result}
          matchDate={matchData.matchDate}
        />
      </div>
    </div>
  );
};
