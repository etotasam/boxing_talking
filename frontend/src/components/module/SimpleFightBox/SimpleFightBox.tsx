import dayjs from 'dayjs';
import clsx from 'clsx';
import { TAILWIND_BREAKPOINT } from '@/assets/tailwindcssBreakpoint';
// ! types
import { MatchDataType } from '@/assets/types';
import { BoxerType } from '@/assets/types';
// ! components
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { useEffect, useState } from 'react';
import {
  PredictionVoteIcon,
  PredictionVoteIconMini,
} from '@/components/atomic/PredictionVoteIcon';
// ! image
import crown from '@/assets/images/etc/champion.svg';
//! hook
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useGuest, useAuth } from '@/hooks/useAuth';

type PropsType = {
  matchData: MatchDataType;
  onClick: (matchId: number) => void;
  className?: string;
  isPredictionVote: boolean | undefined;
};

export const SimpleFightBox = ({
  matchData,
  onClick,
  isPredictionVote,
}: PropsType) => {
  const { data: authUser } = useAuth();
  const { data: isGuest } = useGuest();
  const { isFightToday, isDayOverFight } = useDayOfFightChecker(matchData);
  const { windowSize } = useWindowSize();
  const [isShowPredictionIton, setIsShowPredictionIcon] = useState(false);

  //? 未投票アイコンの表示条件設定
  useEffect(() => {
    if (isPredictionVote === undefined) return;
    if (authUser === undefined) return;
    if (isGuest === undefined) return;
    if (windowSize === undefined) return;
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
  }, [
    isPredictionVote,
    authUser,
    isGuest,
    windowSize,
    isDayOverFight,
    isFightToday,
  ]);

  return (
    <>
      {matchData && (
        <div
          onClick={() => onClick(matchData.id)}
          className={clsx(
            'relative flex justify-between md:w-[90%] w-full max-w-[1024px] cursor-pointer md:py-4 py-8 border-b-[1px]  md:rounded-sm md:hover:bg-yellow-100 md:hover:border-white md:duration-300  md:border-[1px]',
            isDayOverFight && 'bg-stone-100 border-stone-300',
            isFightToday && 'border-red-300 bg-red-50',
            !isDayOverFight && !isFightToday && 'border-stone-400'
          )}
        >
          <BoxerBox boxer={matchData.red_boxer} />

          <MatchInfo matchData={matchData} />

          <BoxerBox boxer={matchData.blue_boxer} />

          {isShowPredictionIton &&
            windowSize !== undefined &&
            windowSize > TAILWIND_BREAKPOINT.md && <PredictionVoteIcon />}
          {isShowPredictionIton &&
            windowSize !== undefined &&
            windowSize < TAILWIND_BREAKPOINT.md && (
              <div className="absolute top-[10px] left-[40%] translate-x-[-50%]">
                <PredictionVoteIconMini />
              </div>
            )}
        </div>
      )}
    </>
  );
};

const MatchInfo = ({ matchData }: { matchData: MatchDataType }) => {
  return (
    <>
      {/* //? 日時 */}
      <div className="py-5 text-stone-600 flex-1">
        <div className="text-center relative">
          <h2 className="xl:text-xl lg:text-lg text-md after:content-['(日本時間)'] after:w-full after:absolute md:after:bottom-[-60%] after:bottom-[-60%] after:left-[50%] after:translate-x-[-50%] xl:after:text-sm after:text-[12px]">
            {dayjs(matchData.match_date).format('YYYY年M月D日')}
          </h2>
          {matchData.titles.length > 0 && (
            <span className="absolute top-[-24px] left-[50%] translate-x-[-50%] w-[24px] h-[24px] mr-2">
              <img src={crown} alt="" />
            </span>
          )}
        </div>
      </div>
    </>
  );
};

const BoxerBox = ({ boxer }: { boxer: BoxerType }) => {
  return (
    <div className="md:w-[300px] flex justify-center items-center flex-1">
      {/* //? 名前 */}
      <div className="flex flex-col justify-center items-center">
        <EngNameWithFlag
          boxerCountry={boxer.country}
          boxerEngName={boxer.eng_name}
        />
        <h2
          className={clsx(
            'lg:text-[20px] sm:text-[16px] mt-1',
            boxer.name.length > 7 ? `text-[12px]` : `text-[16px]`
          )}
        >
          {boxer.name}
        </h2>
      </div>
    </div>
  );
};
