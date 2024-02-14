import dayjs from 'dayjs';
import clsx from 'clsx';
import { TAILWIND_BREAKPOINT } from '@/assets/tailwindcssBreakpoint';
// ! types
import { MatchDataType } from '@/assets/types';
import { BoxerType } from '@/assets/types';
// ! components
import { MatchResultComponent } from '../MatchResultComponent';
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
import { useGuest, useAuth } from '@/hooks/apiHooks/useAuth';

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
  const { isFightToday, isDayOverFight } = useDayOfFightChecker(matchData);
  const isMatchResult = !!matchData.result;
  return (
    <>
      {matchData && (
        <div
          onClick={() => onClick(matchData.id)}
          className={clsx(
            'relative flex justify-between md:w-[90%] w-full max-w-[1024px] cursor-pointer  border-b-[1px]  md:rounded-sm md:hover:bg-yellow-100 md:hover:border-white md:duration-300  md:border-[1px]',
            isMatchResult ? 'md:pt-2 md:pb-1 py-1' : 'md:py-4 py-8',
            isDayOverFight && 'bg-stone-100 border-stone-300',
            isFightToday && 'border-red-300 bg-red-50',
            !isDayOverFight && !isFightToday && 'border-stone-400'
          )}
        >
          <BoxerBox boxer={matchData.red_boxer} />

          <MatchInfo matchData={matchData} />

          <BoxerBox boxer={matchData.blue_boxer} />

          <PredictionIconComponent
            matchData={matchData}
            isPredictionVote={isPredictionVote}
          />
        </div>
      )}
    </>
  );
};

const MatchInfo = ({ matchData }: { matchData: MatchDataType }) => {
  const isTitleMatch = matchData.titles.length;
  const isMatchResult = !!matchData.result;

  return (
    <>
      {/* //? 日時 */}
      <div
        className={clsx(
          'text-stone-600 flex-1',
          isMatchResult ? 'pt-5 pb-2' : 'py-5'
        )}
      >
        <div className="text-center relative flex justify-center items-center">
          <h2 className="absolute top-[2px] md:top-0 xl:text-xl lg:text-lg text-md after:content-['(日本時間)'] after:w-full after:absolute md:after:bottom-[-60%] after:bottom-[-60%] after:left-[50%] after:translate-x-[-50%] xl:after:text-sm after:text-[12px]">
            {dayjs(matchData.match_date).format('YYYY年M月D日')}
          </h2>
          {isTitleMatch ? (
            //? タイトルマッチ
            <div className="absolute top-[-17px] md:top-[-22px] left-[50%] translate-x-[-50%] mr-2 flex justify-center w-full md:text-[16px] text-[14px]">
              <div className="flex">
                <p>{matchData.weight}級</p>
                <img
                  className="ml-2 md:w-[22px] md:h-[22px] w-[18px] h-[18px]"
                  src={crown}
                  alt=""
                />
              </div>
            </div>
          ) : (
            //? ノンタイトルマッチ
            <span className="absolute top-[-17px] md:top-[-22px] left-[50%] translate-x-[-50%] mr-2 w-full md:text-[16px] text-[14px]">
              <p>
                {matchData.weight}級 {matchData.grade}
              </p>
            </span>
          )}
          {isMatchResult && (
            <div className="mt-[50px]">
              <MatchResultComponent matchData={matchData} />
            </div>
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
            'lg:text-[20px] sm:text-[16px] mt-1 font-semibold text-stone-600',
            boxer.name.length > 7 ? `text-[12px]` : `text-[16px]`
          )}
        >
          {boxer.name}
        </h2>
      </div>
    </div>
  );
};

type PredictionIconComponentPropsType = {
  isPredictionVote: boolean | undefined;
  matchData: MatchDataType;
};
const PredictionIconComponent = (props: PredictionIconComponentPropsType) => {
  const { data: authUser } = useAuth();
  const { data: isGuest } = useGuest();
  const { isFightToday, isDayOverFight } = useDayOfFightChecker(
    props.matchData
  );
  const { windowSize } = useWindowSize();
  const [isShowPredictionIcon, setIsShowPredictionIcon] = useState(false);

  const getConditionOfShowPredictionIcon = () => {
    if (props.isPredictionVote === undefined) return false;
    if (authUser === undefined) return false;
    if (isGuest === undefined) return false;
    if (windowSize === undefined) return false;
    if (isDayOverFight === undefined) return false;
    if (isFightToday === undefined) return false;

    const isAuthOrGuest = Boolean(authUser || isGuest);
    const isNotVote = !props.isPredictionVote;
    const isPastMatch = !isDayOverFight && !isFightToday;

    return isAuthOrGuest && isNotVote && isPastMatch;
  };

  //? 未投票アイコンの表示条件設定
  useEffect(() => {
    setIsShowPredictionIcon(getConditionOfShowPredictionIcon());
  }, [
    props.isPredictionVote,
    authUser,
    isGuest,
    windowSize,
    isDayOverFight,
    isFightToday,
  ]);
  return (
    <>
      {isShowPredictionIcon && windowSize! > TAILWIND_BREAKPOINT.md && (
        <PredictionVoteIcon />
      )}
      {isShowPredictionIcon && windowSize! < TAILWIND_BREAKPOINT.md && (
        <div className="absolute top-[8px] left-[50%] translate-x-[-50%]">
          <PredictionVoteIconMini />
        </div>
      )}
    </>
  );
};
