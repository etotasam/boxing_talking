import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { TAILWIND_BREAKPOINT } from '@/assets/tailwindcssBreakpoint';
// ! types
import { MatchDataType } from '@/assets/types';
import { BoxerType } from '@/assets/types';
// ! components
import { MatchResult } from '../MatchResult';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { PredictionIcon } from '@/components/atomic/PredictionIcon';
// ! image
import crown from '@/assets/images/etc/champion.svg';
import { GiImperialCrown } from 'react-icons/gi';
import { MdHowToVote } from 'react-icons/md';

//! hook
import { useWindowSize } from '@/hooks/useWindowSize';
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
import { useFetchUsersPrediction } from '@/hooks/apiHooks/uesWinLossPrediction';

type PropsType = {
  matchData: MatchDataType;
  onClick: (matchId: number) => void;
  className?: string;
};

export const SimpleMatchCard = ({
  matchData,
  onClick,
}: // isPredictionVote,
PropsType) => {
  const isMatchResult = !!matchData.result;

  const { windowSize = 0 } = useWindowSize();
  const predictionIconType: 'DEFAULT' | 'MINI' = windowSize > TAILWIND_BREAKPOINT.md ? 'DEFAULT' : 'MINI';
  return (
    <>
      {matchData && (
        <div
          onClick={() => onClick(matchData.id)}
          className={clsx(
            'relative flex justify-between w-full max-w-[1024px] cursor-pointer border-t-[1px]  text-stone-300',
            'md:w-[80%] md:border-t-0 md:rounded-lg md:bg-stone-200/60 md:hover:bg-stone-200 md:duration-300  md:text-stone-700'
            // isMatchResult ? 'md:pt-2 md:pb-1 py-1' : 'md:py-4 py-8'
          )}
        >
          <BoxerBox boxer={matchData.redBoxer} />

          <NewMatchInfo matchData={matchData} />

          <BoxerBox boxer={matchData.blueBoxer} />

          {/* <PredictionIcon matchData={matchData} iconType={predictionIconType} /> */}
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
      <div className={clsx('flex-1', isMatchResult ? 'pt-5 pb-2' : 'py-5')}>
        <div className="text-center relative flex justify-center items-center">
          <h2 className="absolute top-[2px] md:top-0 xl:text-xl lg:text-lg text-md after:content-['(日本時間)'] after:w-full after:absolute md:after:bottom-[-60%] after:bottom-[-60%] after:left-[50%] after:translate-x-[-50%] xl:after:text-sm after:text-[12px]">
            {dayjs(matchData.matchDate).format('YYYY年M月D日')}
          </h2>
          {isTitleMatch ? (
            //? タイトルマッチ
            <div className="absolute top-[-17px] md:top-[-22px] left-[50%] translate-x-[-50%] mr-2 flex justify-center w-full md:text-[16px] text-[14px]">
              <div className="flex">
                <p>{matchData.weight}級</p>
                <img className="ml-2 md:w-[22px] md:h-[22px] w-[18px] h-[18px]" src={crown} alt="" />
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
              <MatchResult matchData={matchData} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const BoxerBox = ({ boxer }: { boxer: BoxerType }) => {
  //名前が10文字以上で"・"を含む場合、最後の部分を取り出してフォーマット
  let formattedName: string | undefined;
  if (boxer.name.length > 10 && boxer.name.includes('・')) {
    const nameParts = boxer.name.split('・');
    const extractedName: string = nameParts[nameParts.length - 1];
    formattedName = extractedName;
  }
  const boxerName = formattedName ?? boxer.name;
  return (
    <div className="md:w-[300px] flex justify-center items-center flex-1 py-3">
      {/* //? 名前 */}
      <div className="flex flex-col justify-center items-center">
        <EngNameWithFlag boxerCountry={boxer.country} boxerEngName={boxer.engName} />
        <h2
          className={clsx(
            'lg:text-[20px] sm:text-[16px] mt-1 font-semibold whitespace-nowrap',
            boxerName.length > 7 ? `text-[12px]` : `text-[14px]`
          )}
        >
          {boxerName}
        </h2>
      </div>
    </div>
  );
};

const NewMatchInfo = ({ matchData }: { matchData: MatchDataType }) => {
  const isTitleMatch = matchData.titles.length;
  const isMatchResult = !!matchData.result;
  const { isDayOnFight } = useDayOfFightChecker(matchData.matchDate);

  return (
    <div className={clsx('flex-1 py-2')}>
      {isTitleMatch ? <GradeTitleMatch matchData={matchData} /> : <GradeNonTitleMatch matchData={matchData} />}
      {/* //? 日時 */}

      <div className={clsx('mt-2')}>
        <h2 className={clsx('text-center tracking-wide', isDayOnFight && 'text-yellow-500 font-bold')}>
          {dayjs(matchData.matchDate).format('YYYY年M月D日')}
        </h2>
        {/* {isMatchResult && (
              <div className={clsx('')}>
                <MatchResult matchData={matchData} />
              </div>
            )} */}
      </div>
      <VoteIcon matchData={matchData} />
    </div>
  );
};

const GradeTitleMatch = ({ matchData }: { matchData: MatchDataType }) => {
  const isOneTitle = matchData.titles.length === 1;
  const isUnificationMatch = matchData.titles.length > 1;
  return (
    <div className={clsx('text-sm')}>
      <div className={clsx('flex justify-center whitespace-nowrap')}>
        <p className="flex relative h-[20px]">
          {matchData.weight}級
          {isOneTitle && (
            <span className="relative ml-1">
              <GiImperialCrown className={'text-yellow-500 w-[20px] h-[20px]'} />
              <span className="text-[10px] absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-blur">
                {matchData.titles[0].organization}
              </span>
            </span>
          )}
        </p>
      </div>
      {isUnificationMatch && (
        <div className="flex justify-center">
          {matchData.titles.map((title) => (
            <div className="relative ml-2 first-of-type:ml-0">
              <GiImperialCrown className={'text-yellow-500 w-[20px] h-[20px]'} />
              <span className="text-[10px] absolute top-[80%] left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-blur">
                {title.organization}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GradeNonTitleMatch = ({ matchData }: { matchData: MatchDataType }) => {
  return (
    <div className={clsx('text-center text-sm whitespace-nowrap')}>
      <p>
        {matchData.weight}級 {matchData.grade}
      </p>
    </div>
  );
};

const VoteIcon = ({ matchData }: { matchData: MatchDataType }) => {
  const { isDayOnFight, isDayAfterFight } = useDayOfFightChecker(matchData.matchDate);
  const { data: allPrediction } = useFetchUsersPrediction();

  const [isShow, setIsShow] = useState(true);
  useEffect(() => {
    if (!Array.isArray(allPrediction)) return setIsShow(true);
    if (isDayAfterFight === undefined || isDayAfterFight === true) return setIsShow(true);
    if (isDayOnFight === undefined || isDayOnFight === true) return setIsShow(true);

    const isVoteToThisMatch = allPrediction.some((obj) => obj.matchId === matchData.id);
    setIsShow(isVoteToThisMatch);
  }, [allPrediction, isDayAfterFight, isDayOnFight]);

  if (!isShow) return;

  return <>{<MdHowToVote />}</>;
};
