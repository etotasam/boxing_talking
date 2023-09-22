import { useEffect, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
// ! types
import { MatchDataType } from '@/assets/types';
// ! components
import { BoxerInfo } from '../BoxerInfo';
import { FlagImage } from '@/components/atomic/FlagImage';
import { PredictionVoteIcon } from '@/components/atomic/PredictionVoteIcon';
// ! image
import crown from '@/assets/images/etc/champion.svg';
//! hook
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
import { useGuest, useAuth } from '@/hooks/useAuth';

type PropsType = {
  matchData: MatchDataType;
  onClick: (matchId: number) => void;
  className?: string;
  isPredictionVote: boolean | undefined;
};

export const FightBox = ({
  matchData,
  onClick,
  isPredictionVote,
}: PropsType) => {
  const { data: authUser } = useAuth();
  const { data: isGuest } = useGuest();
  const { isFightToday, isDayOverFight } = useDayOfFightChecker(matchData);
  const [isShowPredictionIton, setIsShowPredictionIcon] = useState(false);

  //? 未投票アイコンの表示条件設定
  useEffect(() => {
    if (isPredictionVote === undefined) return;
    if (authUser === undefined) return;
    if (isGuest === undefined) return;
    if (isDayOverFight === undefined) return;
    if (isFightToday === undefined) return;
    setIsShowPredictionIcon(
      Boolean(
        (authUser || isGuest) &&
          !isPredictionVote &&
          isPredictionVote !== undefined &&
          !isDayOverFight &&
          !isFightToday
      )
    );
  }, [isPredictionVote, authUser, isGuest, isDayOverFight, isFightToday]);

  return (
    <>
      {matchData && (
        <div
          onClick={() => onClick(matchData.id)}
          className={clsx(
            'relative flex justify-between w-[80%] max-w-[1024px] min-w-[900px] cursor-pointer border-[1px] rounded-md md:hover:bg-yellow-100 md:hover:border-white md:duration-300',
            isDayOverFight && 'bg-stone-100 border-stone-300',
            isFightToday && 'border-red-300 bg-red-50',
            !isDayOverFight && !isFightToday && 'border-stone-400'
          )}
        >
          <div className="w-[300px]">
            <BoxerInfo boxer={matchData.red_boxer} />
          </div>

          <MatchInfo matchData={matchData} />

          <div className="w-[300px]">
            <BoxerInfo boxer={matchData.blue_boxer} />
          </div>
          {isShowPredictionIton && <PredictionVoteIcon />}
        </div>
      )}
    </>
  );
};

const MatchInfo = ({ matchData }: { matchData: MatchDataType }) => {
  return (
    <>
      {/* //? 日時 */}
      <div className="p-5 text-stone-600">
        <div className="text-center relative mt-5">
          <h2 className="text-2xl after:content-['(日本時間)'] after:absolute after:bottom-[-60%] after:left-[50%] after:translate-x-[-50%] after:text-sm">
            {dayjs(matchData.match_date).format('YYYY年M月D日')}
          </h2>
          {matchData.titles.length > 0 && (
            <span className="absolute top-[-32px] left-[50%] translate-x-[-50%] w-[32px] h-[32px] mr-2">
              <img src={crown} alt="" />
            </span>
          )}
        </div>

        {/* //? グレード */}
        <div className="text-center text-xl mt-5">
          {matchData.grade === 'タイトルマッチ' ? (
            <ul className="flex flex-col">
              {matchData.titles.sort().map((title) => (
                <li key={title} className="mt-1">
                  <div className="relative inline-block text-[18px]">
                    <span className="absolute top-[4px] right-[-28px] w-[18px] h-[18px] mr-2">
                      <img src={crown} alt="" />
                    </span>
                    {title}
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
            {/* <span className="w-[32px] h-[24px] border-[1px] overflow-hidden absolute top-[1px] left-[-40px]"> */}
            {/* </span> */}
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
