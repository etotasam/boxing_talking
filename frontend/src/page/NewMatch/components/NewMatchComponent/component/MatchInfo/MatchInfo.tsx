import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
//! type
import { BoxerType, MatchResultType, MatchDataType } from '@/assets/types';
//! components
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
//! icon
import crown from '@/assets/images/etc/champion.svg';

type MatchInfoPropsType = {
  matchData: MatchDataType;
  // onClick: (matchId: number) => void;
  className?: string;
};
export const MatchInfo = ({ matchData }: MatchInfoPropsType) => {
  return (
    <>
      {matchData && (
        <div
          className={clsx(
            'text-stone-700 relative flex justify-between w-full max-w-[1024px] rounded-lg bg-white/70',
            ' box-border border-[2px]'
          )}
        >
          <div className="w-[300px]">
            <BoxerInfo
              boxer={{ ...matchData.redBoxer, color: 'red' }}
              matchResult={matchData.result}
            />
          </div>

          <div className={clsx('pb-7', matchData.titles.length ? 'pt-10' : 'pt-7')}>
            {/* <MatchInfo matchData={matchData} /> */}
          </div>

          <div className="w-[300px]">
            <BoxerInfo
              boxer={{ ...matchData.blueBoxer, color: 'blue' }}
              matchResult={matchData.result}
            />
          </div>
          {/* <PredictionIcon matchData={matchData} /> */}
        </div>
      )}
    </>
  );
};

type BoxerInfoPropsType = React.ComponentProps<'div'> & {
  boxer: BoxerType & { color: 'red' | 'blue' };
  matchResult?: MatchResultType | null;
};
const BoxerInfo = (props: BoxerInfoPropsType) => {
  const { className, boxer, matchResult = null } = props;
  // const { device } = useWindowSize();
  return (
    <div className={clsx('w-full h-full flex justify-center', className)}>
      <div className="text-center w-full px-5 py-5">
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
      <h2 className={clsx('text-[18px] mt-1')}>{boxer.name}</h2>
    </div>
  );
};

const BoxerStatus = (props: { boxer: BoxerType }) => {
  const { boxer } = props;
  const currentDate = dayjs();
  return (
    <ul className="mt-5">
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
        <p className="flex-1 text-sm">
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
            : 'before:text-gray-600'
        )}
      >
        {boxer.win}
        <span
          className={clsx(
            "absolute text-sm bottom-[-20px] left-[50%] translate-x-[-50%] after:content-['KO']",
            resultState === 'win' && isKo ? 'text-red-700 font-bold' : 'text-gray-600'
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
            : 'before:text-gray-600'
        )}
      >
        {boxer.draw}
      </li>
      <li
        className={clsx(
          "relative flex-1 bg-stone-800 before:content-['LOSE'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm",
          resultState === 'loss'
            ? 'before:text-red-400 before:font-bold text-yellow-300'
            : 'before:text-gray-600'
        )}
      >
        {boxer.lose}
      </li>
    </ul>
  );
};

const Titles = (props: Pick<BoxerType, 'titles'>) => {
  const { titles } = props;
  return (
    <>
      {Boolean(titles.length) && (
        <ul className="mt-1">
          {titles.map((title) => (
            <li key={`${title.organization}_${title.weight}`} className="mt-1">
              <p className="relative inline-block text-[15px] text-stone-600">
                <span className="absolute top-[2px] left-[-22px] w-[18px] h-[18px]">
                  <img src={crown} alt="" />
                </span>
                {`${title.organization}${title.weight}級王者`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
