import clsx from 'clsx';
import dayjs from 'dayjs';
// ! image
import crown from '@/assets/images/etc/champion.svg';
// ! types
import { BoxerType, MatchResultType } from '@/assets/types';
// ! components
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { useEffect, useState } from 'react';
//! hooks
import { useWindowSize } from '@/hooks/useWindowSize';

type BoxerInfoPropsType = React.ComponentProps<'div'> & {
  boxer: BoxerType & { color: 'red' | 'blue' };
  matchResult?: MatchResultType | null;
};

export const BoxerInfo = (props: BoxerInfoPropsType) => {
  const { className, boxer, matchResult = null } = props;
  const { device } = useWindowSize();
  return (
    <div className={clsx('w-full h-full flex justify-center', className)}>
      <div className="text-center w-full px-5 py-5">
        {/* //? 名前 */}
        <BoxerName boxer={boxer} />
        {/* //? 戦績 */}
        <BoxerResume boxer={boxer} matchResult={matchResult} />
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
      <EngNameWithFlag
        boxerCountry={boxer.country}
        boxerEngName={boxer.eng_name}
      />
      <h2 className={clsx('text-[18px] mt-1')}>{boxer.name}</h2>
    </div>
  );
};

type BoxerResumeType = {
  boxer: BoxerType & { color: 'red' | 'blue' };
  matchResult: MatchResultType | null;
};
const BoxerResume = (props: BoxerResumeType) => {
  const { boxer, matchResult } = props;

  //試合結果が登録されているかどうか
  const result = matchResult?.result ?? false;
  const isResult = Boolean(result);

  const isKo = matchResult?.detail
    ? matchResult.detail === 'ko' || matchResult.detail === 'tko'
    : false;

  const [isWin, setIsWin] = useState<boolean>();
  const [isLoss, setIsLoss] = useState<boolean>();
  const [isDraw, setIsDraw] = useState<boolean>();

  //? isWin, isLoss, isDrawをセットする関数
  const setWinLoseResult = () => {
    if (result === boxer.color) {
      setIsWin(true);
      return;
    }

    if (
      isResult &&
      result !== boxer.color &&
      result !== 'draw' &&
      result !== 'no-contest'
    ) {
      setIsLoss(true);
      return;
    }

    if (result === 'draw') {
      setIsDraw(true);
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
          isWin
            ? 'before:text-red-700 before:font-bold text-yellow-300'
            : 'before:text-gray-600'
        )}
      >
        {boxer.win}
        <span
          className={clsx(
            "absolute text-sm bottom-[-20px] left-[50%] translate-x-[-50%] after:content-['KO']",
            isWin && isKo ? 'text-red-700 font-bold' : 'text-gray-600'
          )}
        >
          {boxer.ko}
        </span>
      </li>
      <li
        className={clsx(
          "relative flex-1 bg-gray-500 before:content-['DRAW'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm",
          isDraw
            ? 'before:text-blue-700 before:font-bold text-yellow-300'
            : 'before:text-gray-600'
        )}
      >
        {boxer.draw}
      </li>
      <li
        className={clsx(
          "relative flex-1 bg-stone-800 before:content-['LOSE'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm",
          isLoss
            ? 'before:text-red-400 before:font-bold text-yellow-300'
            : 'before:text-gray-600'
        )}
      >
        {boxer.lose}
      </li>
    </ul>
  );
};

const BoxerStatus = (props: { boxer: BoxerType }) => {
  const { boxer } = props;
  const currentDate = dayjs();
  return (
    <ul className="mt-5">
      <li className="flex justify-between">
        <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
          年齢
        </p>
        <p className="flex-1">{currentDate.diff(dayjs(boxer.birth), 'year')}</p>
      </li>
      <li className="flex justify-between">
        <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
          身長
        </p>
        {boxer.height ? (
          <p className="flex-1 after:content-['cm'] after:ml-1">
            {boxer.height}
          </p>
        ) : (
          <p className="flex-1">-</p>
        )}
      </li>
      <li className="flex justify-between">
        <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
          リーチ
        </p>
        {boxer.reach ? (
          <p className="flex-1 after:content-['cm'] after:ml-1">
            {boxer.reach}
          </p>
        ) : (
          <p className="flex-1">-</p>
        )}
      </li>
      <li className="flex justify-between">
        <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
          スタイル
        </p>
        <p className="flex-1 text-sm">
          {boxer.style === 'orthodox' && 'オーソドックス'}
          {boxer.style === 'southpaw' && 'サウスポー'}
          {boxer.style === 'unknown' && '-'}
        </p>
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
                {`${title.organization}世界${title.weight}級王者`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
