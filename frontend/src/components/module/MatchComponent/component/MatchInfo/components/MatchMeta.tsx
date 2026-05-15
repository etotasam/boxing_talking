import clsx from 'clsx';
import dayjs from 'dayjs';
import { MatchDataType } from '@/types';
import { FlagImage } from '@/components/atomic/FlagImage';

export const MatchDate = ({ matchDate }: Pick<MatchDataType, 'matchDate'>) => {
  return (
    <div className="flex justify-center flex-1 pb-5">
      <div className="relative text-white font-clamp-level-1">
        <h2 className="after:content-['(日本時間)'] after:absolute after:bottom-[-70%] after:left-[50%] after:translate-x-[-50%] after:text-xs">
          {dayjs(matchDate).format('YYYY年M月D日')}
        </h2>
      </div>
    </div>
  );
};

export const MatchVenue = ({
  country: placeCountry,
  venue,
}: Pick<MatchDataType, 'country' | 'venue'>) => {
  return (
    <div className="text-center font-clamp-level-1 text-white relative flex-1 pb-5">
      <span className="overflow-hidden absolute top-[25px] left-[50%] translate-x-[-50%]">
        <FlagImage
          className="inline-block border-[1px] w-[24px] h-[18px]"
          nationality={placeCountry}
        />
      </span>
      <span className={clsx('')}>{venue}</span>
    </div>
  );
};
