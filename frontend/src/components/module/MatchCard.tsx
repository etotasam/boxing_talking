import dayjs from 'dayjs';
import clsx from 'clsx';
import { MatchDataType } from '@/types';
import { BoxerType } from '@/types';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { VoteIconForTop } from '@/components/module/MatchComponent/component/VoteIcon';
import { GiImperialCrown } from 'react-icons/gi';

import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
import { useVoteIconState } from '@/hooks/useVoteIconState';
import { useRecoilValue } from 'recoil';
import { deviceState } from '@/store/deviceState';

type PropsType = {
  matchData: MatchDataType;
  onClick: (matchId: number) => void;
  className?: string;
};

export const MatchCard = ({
  matchData,
  onClick,
}: // isPredictionVote,
PropsType) => {
  const isShowVoteIcon = useVoteIconState({ matchDate: matchData.matchDate, id: matchData.id });
  return (
    <>
      {matchData && (
        <div
          onClick={() => onClick(matchData.id)}
          className={clsx(
            'relative flex justify-between w-full cursor-pointer border-[1px] border-neutral-700  text-stone-300 bg-stone-50/10 rounded-md',
            'pc:hover:bg-red-600/80 hover:white pc:hover:border-neutral-300 pc:duration-300'
            // isMatchResult ? 'pc:pt-2 pc:pb-1 py-1' : 'pc:py-4 py-8'
          )}
        >
          <BoxerBox boxer={matchData.redBoxer} />

          <MatchInfo matchData={matchData} />

          <BoxerBox boxer={matchData.blueBoxer} />

          {isShowVoteIcon && (
            <div className="absolute top-2 left-2">
              {/* <VoteIcon matchData={matchData} /> */}
              <VoteIconForTop />
            </div>
          )}
        </div>
      )}
    </>
  );
};

const BoxerBox = ({ boxer }: { boxer: BoxerType }) => {
  const device = useRecoilValue(deviceState);
  //名前が10文字以上で"・"を含む場合、最後の部分を取り出してフォーマット
  let formattedName: string | undefined;
  if (boxer.name.length > 10 && boxer.name.includes('・')) {
    const nameParts = boxer.name.split('・');
    const extractedName: string = nameParts[nameParts.length - 1];
    formattedName = extractedName;
  }
  const boxerName = formattedName ?? boxer.name;
  const isLongName = device === 'SP' && boxerName.length > 7 && boxerName.length < 11;
  const isTooLongName = device === 'SP' && boxerName.length > 11;
  const normalLengthName = device === 'PC' || boxerName.length < 7;
  return (
    <div className="flex justify-center items-center flex-1 py-3">
      <div className="flex flex-col justify-center items-center">
        <EngNameWithFlag boxerCountry={boxer.country} boxerEngName={boxer.engName} />
        <h2
          className={clsx(
            'mt-1 font-semibold whitespace-nowrap',
            isLongName && `text-[12px]`,
            isTooLongName && 'text-[10px]',
            normalLengthName && 'text-[14px]'
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
              <CrownIconContainer title={matchData.titles[0].organization} />
            </span>
          )}
        </div>
      </div>
      {isUnificationMatch && (
        <div className="flex justify-center mt-1">
          {matchData.titles.map((title) => (
            <div key={title.organization} className="relative ml-2 first-of-type:ml-0">
              <GiImperialCrown className={'text-yellow-500 w-[20px] h-[20px]'} />
              <CrownIconContainer title={title.organization} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CrownIconContainer = ({ title }: { title: string }) => {
  const index = title.indexOf('暫定');
  const titleArray: string[] | undefined =
    index !== -1 ? [title.slice(0, index), title.slice(index)] : undefined;

  return titleArray && titleArray.length ? (
    <span className="text-[10px] absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-blur w-full">
      <span className="w-full absolute top-[-18px]">
        {titleArray[1]} {/* 暫定 */}
      </span>
      <span className="w-full absolute top-[-8px]">{titleArray[0]}</span>
    </span>
  ) : (
    <span className="text-[10px] absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-blur">
      {title}
    </span>
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
