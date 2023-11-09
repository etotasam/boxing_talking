import dayjs from 'dayjs';
// ! types
import { MatchDataType } from '@/assets/types';
// ! image
import crown from '@/assets/images/etc/champion.svg';
//! component
import { FlagImage } from '@/components/atomic/FlagImage';

export const MatchInfo = ({ matchData }: { matchData: MatchDataType }) => {
  return (
    <>
      {/* //? 日時 */}
      <div className="p-5 text-stone-600">
        <div className="text-center relative mt-5">
          <h2 className="text-2xl after:content-['(日本時間)'] after:absolute after:bottom-[-60%] after:left-[50%] after:translate-x-[-50%] after:text-sm">
            {dayjs(matchData.match_date).format('YYYY年M月D日')}
          </h2>
          {Boolean(matchData.titles.length) && (
            <span className="absolute top-[-32px] left-[50%] translate-x-[-50%] w-[32px] h-[32px] mr-2">
              <img src={crown} alt="" />
            </span>
          )}
        </div>

        {/* //? グレード */}
        <div className="text-center text-xl mt-5">
          {matchData.grade === 'タイトルマッチ' ? (
            <ul className="flex flex-col">
              {matchData.titles
                .sort()
                .map(({ organization, weightDivision }, index) => (
                  <li key={index} className="mt-1">
                    <div className="relative inline-block text-[18px]">
                      <span className="absolute top-[4px] right-[-28px] w-[18px] h-[18px] mr-2">
                        <img src={crown} alt="" />
                      </span>
                      {organization}世界{weightDivision}級
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-[30px] mt-7">{matchData.grade}</p>
          )}
        </div>

        {/* //?会場 */}
        <div className="mt-[35px] text-center">
          <div className="relative flex items-center justify-center text-lg before:content-['会場'] before:absolute before:top-[-25px] before:left-[50%] before:translate-x-[-50%] before:text-[14px] before:text-stone-500">
            <FlagImage
              className="inline-block border-[1px] w-[32px] h-[24px] mr-3"
              nationality={matchData.country}
            />
            {matchData.venue}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="relative inline-block text-lg before:content-['階級'] before:absolute before:top-[-25px] before:min-w-[100px] before:left-[50%] before:translate-x-[-50%] before:text-[14px] before:text-stone-500">
            {`${matchData.weight.replace('S', 'スーパー')}級`}
          </p>
        </div>
      </div>
    </>
  );
};
