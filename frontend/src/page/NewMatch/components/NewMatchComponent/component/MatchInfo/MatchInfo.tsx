import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
//! type
import { BoxerType, MatchResultType, MatchDataType } from '@/assets/types';
//! components
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { SubHeadline } from '@/components/atomic/SubHeadline';
import { FlagImage } from '@/components/atomic/FlagImage';
//! hooks
import { useWindowSize } from '@/hooks/useWindowSize';
//! icon
import crown from '@/assets/images/etc/champion.svg';
import { GiImperialCrown } from 'react-icons/gi';

type MatchInfoPropsType = {
  matchData: MatchDataType;
  // onClick: (matchId: number) => void;
  className?: string;
};
export const MatchInfo = ({ matchData }: MatchInfoPropsType) => {
  return (
    <>
      {matchData && (
        <div className="flex flex-col items-center w-full relative">
          <BoxersData matchData={matchData} />
          <Grade matchData={matchData} />
          <div className="flex w-[80%]">
            <MatchDate matchDate={matchData.matchDate} />
            <MatchVenue country={matchData.country} venue={matchData.venue} />
          </div>
        </div>
      )}
    </>
  );
};

const BoxersData = ({ matchData }: MatchInfoPropsType) => {
  const { device } = useWindowSize();
  return (
    <div className={clsx('text-white relative flex justify-between w-full max-w-[1024px]')}>
      <div className={`${device === 'PC' ? 'w-[45%]' : 'w-[50%]'}`}>
        <BoxerInfo boxer={{ ...matchData.redBoxer, color: 'red' }} matchResult={matchData.result} />
      </div>

      <div className={`${device === 'PC' ? 'w-[45%]' : 'w-[50%]'}`}>
        <BoxerInfo
          boxer={{ ...matchData.blueBoxer, color: 'blue' }}
          matchResult={matchData.result}
        />
      </div>
      {/* <PredictionIcon matchData={matchData} /> */}
    </div>
  );
};

type BoxerInfoPropsType = React.ComponentProps<'div'> & {
  boxer: BoxerType & { color: 'red' | 'blue' };
  matchResult?: MatchResultType | null;
};
const BoxerInfo = (props: BoxerInfoPropsType) => {
  const { className, boxer, matchResult = null } = props;
  const { device } = useWindowSize();
  return (
    <div className={clsx('w-full h-full flex justify-center', className)}>
      <div className={clsx('text-center w-full py-5', device === 'PC' ? 'px-5' : 'px-2')}>
        {/* //? 名前 */}
        <BoxerName boxer={boxer} />
        {/* //? 戦績 */}
        <BoxerRecord boxer={boxer} matchResult={matchResult} />
        {/* //? ステータス */}
        <BoxerStatus boxer={boxer} />
        {/* //? タイトル */}
        <Titles titles={boxer.titles} />
      </div>
    </div>
  );
};

const BoxerName = ({ boxer }: { boxer: BoxerType }) => {
  return (
    <div className="">
      <EngNameWithFlag boxerCountry={boxer.country} boxerEngName={boxer.engName} />
      <h2 className={clsx('font-clamp-level-1 mt-1')}>{boxer.name}</h2>
    </div>
  );
};

const BoxerStatus = (props: { boxer: BoxerType }) => {
  const { boxer } = props;
  const currentDate = dayjs();
  return (
    <ul className="mt-5 font-clamp-level-1">
      <li className="flex justify-between">
        <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">年齢</p>
        <p className="flex-1">{currentDate.diff(dayjs(boxer.birth), 'year')}</p>
      </li>
      <li className="flex justify-between">
        <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">身長</p>
        {boxer.height ? (
          <p className="flex-1 after:content-['cm'] after:ml-1">{boxer.height}</p>
        ) : (
          <p className="flex-1">-</p>
        )}
      </li>
      <li className="flex justify-between">
        <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">リーチ</p>
        {boxer.reach ? (
          <p className="flex-1 after:content-['cm'] after:ml-1">{boxer.reach}</p>
        ) : (
          <p className="flex-1">-</p>
        )}
      </li>
      <li className="flex justify-between">
        <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">スタイル</p>
        <p className={`flex-1`}>
          {boxer.style === 'orthodox' && 'オーソドックス'}
          {boxer.style === 'southpaw' && 'サウスポー'}
          {boxer.style === 'unknown' && '-'}
        </p>
      </li>
    </ul>
  );
};

type BoxerRecordType = {
  boxer: BoxerType & { color: 'red' | 'blue' };
  matchResult: MatchResultType | null;
};
const BoxerRecord = (props: BoxerRecordType) => {
  const { boxer, matchResult } = props;

  //試合結果が登録されているかどうか
  const result = matchResult?.result ?? false;
  const isResult = Boolean(result);

  const isKo = matchResult?.detail
    ? matchResult.detail === 'ko' || matchResult.detail === 'tko'
    : false;

  // const [isWin, setIsWin] = useState<boolean>();
  // const [isLoss, setIsLoss] = useState<boolean>();
  // const [isDraw, setIsDraw] = useState<boolean>();

  const [resultState, setResultState] = useState<'win' | 'loss' | 'draw' | null>(null);

  //? isWin, isLoss, isDrawをセットする関数
  const setWinLoseResult = () => {
    if (result === boxer.color) {
      // setIsWin(true);
      setResultState('win');
      return;
    }

    if (isResult && result !== boxer.color && result !== 'draw' && result !== 'no-contest') {
      // setIsLoss(true);
      setResultState('loss');
      return;
    }

    if (result === 'draw') {
      // setIsDraw(true);
      setResultState('draw');
      return;
    }
  };

  useEffect(() => {
    if (!isResult) return;
    setWinLoseResult();
  }, [isResult]);
  return (
    <ul className="flex justify-between w-full mt-5 text-white">
      <li
        className={clsx(
          "relative flex-1 bg-red-500 before:content-['WIN'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm",
          resultState === 'win'
            ? 'before:text-red-700 before:font-bold text-yellow-300'
            : 'before:text-stone-500'
        )}
      >
        {boxer.win}
        <span
          className={clsx(
            "absolute text-sm bottom-[-20px] left-[50%] translate-x-[-50%] after:content-['KO']",
            resultState === 'win' && isKo ? 'text-red-700 font-bold' : 'text-stone-500'
          )}
        >
          {boxer.ko}
        </span>
      </li>
      <li
        className={clsx(
          "relative flex-1 bg-gray-500 before:content-['DRAW'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm",
          resultState === 'draw'
            ? 'before:text-blue-700 before:font-bold text-yellow-300'
            : 'before:text-stone-500'
        )}
      >
        {boxer.draw}
      </li>
      <li
        className={clsx(
          "relative flex-1 bg-stone-800 before:content-['LOSE'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm",
          resultState === 'loss'
            ? 'before:text-red-400 before:font-bold text-yellow-300'
            : 'before:text-stone-500'
        )}
      >
        {boxer.lose}
      </li>
    </ul>
  );
};

const Titles = ({ titles }: Pick<BoxerType, 'titles'>) => {
  return (
    <>
      {Boolean(titles.length) && (
        <ul className="mt-1">
          {titles.map((title) => (
            <li key={`${title.organization}_${title.weight}`} className="mt-1">
              <p className="font-clamp-level-0 relative inline-block text-[15px] text-yellow-500/70">
                <span className="absolute top-[2px] left-[-22px] w-[18px] h-[18px]">
                  <img src={crown} alt="" />
                </span>
                {`${title.organization}${title.weight}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

const MatchDate = ({ matchDate }: Pick<MatchDataType, 'matchDate'>) => {
  return (
    <div className="flex justify-center flex-1 pb-5">
      <div className="relative text-white font-clamp-level-1">
        <h2 className="after:content-['(日本時間)'] after:absolute after:bottom-[-70%] after:left-[50%] after:translate-x-[-50%] after:text-xs">
          {dayjs(matchDate).format('YYYY年M月D日')}
        </h2>
      </div>
    </div>
  );
};

//? 会場
const MatchVenue = ({ country: placeCountry, venue }: Pick<MatchDataType, 'country' | 'venue'>) => {
  const isLongText = (text: string): boolean => {
    return text.length > 10;
  };
  return (
    <div className={'text-center font-clamp-level-1 text-white relative flex-1 pb-5'}>
      {/* <SubHeadline content="会場"> */}
      <span className="overflow-hidden absolute top-[25px] left-[50%] translate-x-[-50%]">
        <FlagImage
          className="inline-block border-[1px] w-[24px] h-[18px]"
          nationality={placeCountry}
        />
      </span>
      <span className={clsx('')}>{venue}</span>
      {/* <span className={clsx(isLongText(venue) && 'text-[14px]')}>{venue}</span> */}
      {/* </SubHeadline> */}
    </div>
  );
};

const Grade = ({ matchData }: { matchData: MatchDataType }) => {
  const isTitleMatch = matchData.grade === 'タイトルマッチ';
  const isOneTitle = matchData.titles.length === 1;
  const isUnificationMatch = matchData.titles.length > 1;
  return (
    <div className={clsx('font-clamp-level-1 flex-1 text-white')}>
      <div className={clsx('flex justify-center whitespace-nowrap')}>
        <div className="flex items-end">
          <span className="">{matchData.weight}級</span>

          {isOneTitle && (
            <span className="relative ml-1">
              <GiImperialCrown className={'text-yellow-500 w-[30px] h-[30px]'} />
              <CrownIconContainer title={matchData.titles[0].organization} />
            </span>
          )}
          {!isTitleMatch && <span className="ml-3">{matchData.grade}</span>}
        </div>
      </div>
      {isUnificationMatch && (
        <div className="flex justify-center mt-1">
          {matchData.titles.map((title) => (
            <div key={title.organization} className="relative ml-2 first-of-type:ml-0">
              <GiImperialCrown className={'text-yellow-500 w-[30px] h-[30px]'} />
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
    <span className="text-[13px] absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-blur w-full">
      <span className="w-full absolute top-[-18px]">
        {titleArray[1]} {/* 暫定 */}
      </span>
      <span className="w-full absolute top-[-8px]">{titleArray[0]}</span>
    </span>
  ) : (
    <span className="text-[13px] absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-blur">
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
