import clsx from 'clsx';
import dayjs from 'dayjs';
// ! types
import { MatchDataType } from '@/assets/types';
// ! image
import crown from '@/assets/images/etc/champion.svg';
//! component
import { FlagImage } from '@/components/atomic/FlagImage';
import { SubHeadline } from '@/components/atomic/SubHeadline';
import { MatchResult } from './MatchResult';
//! hooks
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';

export const MatchInfo = ({ matchData }: { matchData: MatchDataType }) => {
  const { isDayOnFight, isDayAfterFight } = useDayOfFightChecker(matchData.matchDate);

  const isShowMatchResultComponent = Boolean(!isDayOnFight && isDayAfterFight && matchData.result);

  // const isTitleMatch: boolean = matchData.grade === 'タイトルマッチ';

  const isLongText = (text: string): boolean => {
    return text.length > 10;
  };

  return (
    <>
      <div className={clsx('')}>
        {/* //? 日時 */}
        <div className="text-center relative">
          <MatchDate matchData={matchData} />
        </div>

        {/* //? グレード */}
        <div className="text-center text-xl mt-5">
          <Grade matchData={matchData} />
        </div>

        {/* //?会場 */}
        <div className={'mt-7 text-center text-[8px]'}>
          <SubHeadline content="会場">
            <span className="lg:w-[32px] lg:h-[24px] w-[24px] h-[18px] overflow-hidden absolute top-[1px] lg:left-[-35px] left-[-30px]">
              <FlagImage
                className="inline-block border-[1px] lg:w-[24px] lg:h-[18px] w-[24px] h-[18px]"
                nationality={matchData.country}
              />
            </span>
            <span className={clsx(isLongText(matchData.venue) && 'text-[14px]')}>
              {matchData.venue}
            </span>
          </SubHeadline>
        </div>

        {/* //?階級 */}
        <div className="mt-7 text-center">
          <SubHeadline content="階級">
            {`${matchData.weight.replace('S', 'スーパー')}級`}
          </SubHeadline>
        </div>

        {isShowMatchResultComponent && (
          //?試合結果
          <div className="mt-7 text-center">
            <SubHeadline content="試合結果">
              <MatchResult matchData={matchData} />
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
        {dayjs(matchData.matchDate).format('YYYY年M月D日')}
      </h2>
      {Boolean(matchData.titles.length) && (
        <span className="absolute top-[-32px] left-[50%] translate-x-[-50%] w-[32px] h-[32px] mr-2">
          <img src={crown} alt="crown" />
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
          {matchData.titles.sort().map(({ organization, weightDivision }, index) => (
            <li key={index} className="mt-1">
              <div className="text-shadow text-yellow-500 relative inline-block tracking-widest text-[18px]">
                <span className="absolute top-[4px] right-[-28px] w-[20px] h-[20px] mr-2">
                  <img src={crown} alt="" />
                </span>
                {organization}
                {weightDivision}級
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-2xl">{matchData.grade}</div>
      )}
    </>
  );
};
