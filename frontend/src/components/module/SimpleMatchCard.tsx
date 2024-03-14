import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { TAILWIND_BREAKPOINT } from '@/assets/tailwindcssBreakpoint';
import { motion } from 'framer-motion';
// ! types
import { MatchDataType } from '@/assets/types';
import { BoxerType } from '@/assets/types';
// ! components
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
// ! image
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
  const predictionIconType: 'DEFAULT' | 'MINI' =
    windowSize > TAILWIND_BREAKPOINT.md ? 'DEFAULT' : 'MINI';
  return (
    <>
      {matchData && (
        <div
          onClick={() => onClick(matchData.id)}
          className={clsx(
            'relative flex justify-between w-full max-w-[1024px] cursor-pointer last-of-type:border-b-[1px] border-t-[1px] border-neutral-700  text-stone-300 bg-stone-50/10 rounded-md',
            'md:w-[80%] md:border-t-0 md:rounded-lg md:bg-stone-200/60 md:hover:bg-stone-200 md:duration-300  md:text-stone-700'
            // isMatchResult ? 'md:pt-2 md:pb-1 py-1' : 'md:py-4 py-8'
          )}
        >
          <BoxerBox boxer={matchData.redBoxer} />

          <MatchInfo matchData={matchData} />

          <BoxerBox boxer={matchData.blueBoxer} />

          {/* <PredictionIcon matchData={matchData} iconType={predictionIconType} /> */}
          <div className="absolute top-1 left-1">
            <VoteIcon matchData={matchData} />
          </div>
        </div>
      )}
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

const MatchInfo = ({ matchData }: { matchData: MatchDataType }) => {
  const isTitleMatch = matchData.titles.length;
  const { isDayOnFight } = useDayOfFightChecker(matchData.matchDate);

  return (
    <div className={clsx('flex-1 py-3 relative')}>
      {isTitleMatch ? (
        <GradeTitleMatch matchData={matchData} />
      ) : (
        <GradeNonTitleMatch matchData={matchData} />
      )}
      {/* //? 日時 */}

      <div className={clsx('mt-1')}>
        <time
          dateTime={dayjs(matchData.matchDate).toISOString()}
          className={clsx(
            'block text-center tracking-wide',
            isDayOnFight && 'text-yellow-500 font-bold'
          )}
        >
          {dayjs(matchData.matchDate).format('YYYY年M月D日')}
        </time>
        {/* {isMatchResult && (
              <div className={clsx('')}>
                <MatchResult matchData={matchData} />
              </div>
            )} */}
      </div>
    </div>
  );
};

const GradeTitleMatch = ({ matchData }: { matchData: MatchDataType }) => {
  const isOneTitle = matchData.titles.length === 1;
  const isUnificationMatch = matchData.titles.length > 1;
  return (
    <div className={clsx('text-xs')}>
      <div className={clsx('flex justify-center whitespace-nowrap')}>
        <div className="flex items-end">
          {matchData.weight}級
          {isOneTitle && (
            <span className="relative ml-1">
              <GiImperialCrown className={'text-yellow-500 w-[20px] h-[20px]'} />
              <span className="text-[10px] absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-blur">
                {matchData.titles[0].organization}
              </span>
            </span>
          )}
        </div>
      </div>
      {isUnificationMatch && (
        <div className="flex justify-center mt-1">
          {matchData.titles.map((title) => (
            <div key={title.organization} className="relative ml-2 first-of-type:ml-0">
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
    <div className={clsx('text-center text-xs whitespace-nowrap')}>
      <p>
        {matchData.weight}級 {matchData.grade}
      </p>
    </div>
  );
};

const VoteIcon = ({ matchData }: { matchData: MatchDataType }) => {
  const { isDayOnFight, isDayAfterFight } = useDayOfFightChecker(matchData.matchDate);
  const { data: usersPredictions } = useFetchUsersPrediction();

  const [isHide, setIsHide] = useState(true);
  useEffect(() => {
    //? ユーザーの投票をfetch出来てない時は隠す
    if (usersPredictions === undefined) return setIsHide(true);
    //? 過去の試合には表示しない
    if (isDayAfterFight === undefined || isDayAfterFight === true) return setIsHide(true);
    //? 当日は表示しない
    if (isDayOnFight === undefined || isDayOnFight === true) return setIsHide(true);
    //? ユーザーのこの試合への投票の有無で表示を決定させる

    const isVote = usersPredictions.some((obj) => obj.matchId === matchData.id);
    setIsHide(isVote);
  }, [usersPredictions, isDayAfterFight, isDayOnFight]);

  if (isHide) return;

  return (
    <>
      <motion.div
        animate={{ x: [0, 3, -3, 0] }}
        transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3 }}
        className="bg-green-600 p-1 rounded-[50%] text-neutral-900 text-xs"
      >
        <MdHowToVote />
      </motion.div>
    </>
  );
};
