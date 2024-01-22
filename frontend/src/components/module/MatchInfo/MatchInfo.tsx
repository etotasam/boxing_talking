import { useRef } from 'react';
import dayjs from 'dayjs';
// ! types
import { MatchDataType } from '@/assets/types';
// ! image
import crown from '@/assets/images/etc/champion.svg';
//! component
import { FlagImage } from '@/components/atomic/FlagImage';
import { SubHeadline } from '@/components/atomic/SubHeadline';

export const MatchInfo = ({ matchData }: { matchData: MatchDataType }) => {
  const matchResult = useRef<string | null>(null);

  if (!matchData) return <div>選択なし</div>;

  if (matchData.match_result) {
    if (matchData.match_result === 'red')
      matchResult.current = matchData.red_boxer.name;
    if (matchData.match_result === 'blue')
      matchResult.current = matchData.red_boxer.name;
    if (matchData.match_result === 'draw') matchResult.current = '引き分け';
    if (matchData.match_result === 'no-contest')
      matchResult.current = '無効試合';
  }

  return (
    <>
      <div className="p-5 text-stone-600">
        {/* //? 日時 */}
        <div className="text-center relative mt-5">
          <MatchDate matchData={matchData} />
        </div>

        {/* //? グレード */}
        <div className="text-center text-xl mt-5">
          <Grade matchData={matchData} />
        </div>

        {/* //?会場 */}
        <div className="mt-[35px] text-center">
          <SubHeadline content="会場">
            <span className="lg:w-[32px] lg:h-[24px] w-[24px] h-[18px] border-[1px] overflow-hidden absolute top-[1px] lg:left-[-40px] left-[-30px]">
              <FlagImage
                className="inline-block border-[1px] lg:w-[32px] lg:h-[24px] w-[24px] h-[18px] mr-3"
                nationality={matchData.country}
              />
            </span>
            {matchData.venue}
          </SubHeadline>
        </div>

        {/* //?階級 */}
        <div className="mt-10 text-center">
          <SubHeadline content="階級">
            {`${matchData.weight.replace('S', 'スーパー')}級`}
          </SubHeadline>
        </div>

        {/* 勝者 */}
        {matchData.match_result && (
          <div className="mt-10 text-center">
            <SubHeadline content="試合結果">
              <span className="flex">
                <span className="bg-yellow-500 rounded-sm text-sm flex justify-center items-center text-white px-3 py-1 mr-2">
                  12-KO
                </span>

                {matchResult.current}
              </span>
            </SubHeadline>
          </div>
        )}
      </div>
    </>
  );
};

const MatchDate = ({ matchData }: { matchData: MatchDataType }) => {
  return (
    <>
      <h2 className="text-2xl after:content-['(日本時間)'] after:absolute after:bottom-[-60%] after:left-[50%] after:translate-x-[-50%] after:text-sm">
        {dayjs(matchData.match_date).format('YYYY年M月D日')}
      </h2>
      {Boolean(matchData.titles.length) && (
        <span className="absolute top-[-32px] left-[50%] translate-x-[-50%] w-[32px] h-[32px] mr-2">
          <img src={crown} alt="" />
        </span>
      )}
    </>
  );
};

const Grade = ({ matchData }: { matchData: MatchDataType }) => {
  return (
    <>
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
    </>
  );
};
