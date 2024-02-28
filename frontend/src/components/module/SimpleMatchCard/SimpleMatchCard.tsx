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
//! hook
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
import { useWindowSize } from '@/hooks/useWindowSize';

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
  // const { isFightToday, isDayOverFight } = useDayOfFightChecker(matchData);
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
            'relative flex justify-between w-full max-w-[1024px] cursor-pointer border-t-[1px] bg-white/70 text-stone-200',
            'md:w-[90%] md:border-t-0 md:rounded-lg md:bg-stone-200/60 md:hover:bg-stone-200 md:duration-300  md:text-stone-700',
            isMatchResult ? 'md:pt-2 md:pb-1 py-1' : 'md:py-4 py-8'
            // isDayOverFight && 'bg-stone-200/80 border-stone-300',
            // isFightToday && 'border-red-300 bg-red-50'
            // !isDayOverFight && !isFightToday && 'border-stone-400'
          )}
        >
          <BoxerBox boxer={matchData.redBoxer} />

          <MatchInfo matchData={matchData} />

          <BoxerBox boxer={matchData.blueBoxer} />

          <PredictionIcon matchData={matchData} iconType={predictionIconType} />
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
    <div className="md:w-[300px] flex justify-center items-center flex-1">
      {/* //? 名前 */}
      <div className="flex flex-col justify-center items-center">
        <EngNameWithFlag boxerCountry={boxer.country} boxerEngName={boxer.engName} />
        <h2
          className={clsx(
            'lg:text-[20px] sm:text-[16px] mt-1 font-semibold',
            boxerName.length > 7 ? `text-[12px]` : `text-[16px]`
          )}
        >
          {boxerName}
        </h2>
      </div>
    </div>
  );
};
