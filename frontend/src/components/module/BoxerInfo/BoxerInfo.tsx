import clsx from 'clsx';
import dayjs from 'dayjs';
// ! image
import crown from '@/assets/images/etc/champion.svg';
// ! types
import { BoxerType, MatchResultType } from '@/assets/types';
// ! components
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { useEffect, useState } from 'react';

type PropsType = React.ComponentProps<'div'> & {
  boxer: BoxerType & { color: 'red' | 'blue' };
  matchResult?: MatchResultType | null;
};

export const BoxerInfo = ({ boxer, className, matchResult }: PropsType) => {
  const currentDate = dayjs();
  const isResult = matchResult?.result ?? false;
  const isKo = matchResult?.detail
    ? matchResult.detail === 'ko' || matchResult.detail === 'tko'
    : false;

  const [isWin, setIsWin] = useState<boolean>();
  const [isLoss, setIsLoss] = useState<boolean>();
  const [isDraw, setIsDraw] = useState<boolean>();

  //? isWin, isLoss, isDrawをセットする関数
  const setWinLoseResult = () => {
    if (isResult === boxer.color) {
      setIsWin(true);
      return;
    }

    if (
      isResult &&
      isResult !== boxer.color &&
      isResult !== 'draw' &&
      isResult !== 'no-contest'
    ) {
      setIsLoss(true);
      return;
    }

    if (isResult === 'draw') {
      setIsDraw(true);
      return;
    }
  };

  useEffect(() => {
    if (!isResult) return;
    setWinLoseResult();
  }, [isResult]);

  return (
    <div className={clsx('w-[300px] h-full flex justify-center', className)}>
      {/* <div className="h-[60%] border-b-[1px] border-stone-300">データ</div> */}
      <div className="text-center w-full px-5 py-5">
        <div>
          {/* //? 名前 */}
          <div className="">
            <EngNameWithFlag
              boxerCountry={boxer.country}
              boxerEngName={boxer.eng_name}
            />
            <h2 className="text-[18px] mt-1 font-semibold text-stone-600">
              {boxer.name}
            </h2>
          </div>
          {/* //? 戦績 */}
          <ul className="flex justify-between w-full mt-7 text-white">
            <li
              className={clsx(
                "relative flex-1 bg-red-500 before:content-['WIN'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm",
                isWin
                  ? 'before:text-red-600 before:font-bold text-yellow-300'
                  : 'before:text-gray-600'
              )}
            >
              {boxer.win}
              <span
                className={clsx(
                  "absolute text-sm bottom-[-20px] left-[50%] translate-x-[-50%] after:content-['KO']",
                  isWin && isKo ? 'text-blue-600 font-bold' : 'text-gray-600'
                )}
              >
                {boxer.ko}
              </span>
            </li>
            <li
              className={clsx(
                "relative flex-1 bg-gray-500 before:content-['DRAW'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm",
                isDraw
                  ? 'before:text-red-600 before:font-bold text-yellow-300'
                  : 'before:text-gray-600'
              )}
            >
              {boxer.draw}
            </li>
            <li
              className={clsx(
                "relative flex-1 bg-stone-800 before:content-['LOSE'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm",
                isLoss
                  ? 'before:text-red-600 before:font-bold text-yellow-300'
                  : 'before:text-gray-600'
              )}
            >
              {boxer.lose}
            </li>
          </ul>
          {/* //? ステータス */}
          <ul className="mt-8">
            <li className="flex justify-between mt-1">
              <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                年齢
              </p>
              <p className="flex-1">
                {currentDate.diff(dayjs(boxer.birth), 'year')}
              </p>
            </li>
            <li className="flex justify-between mt-1">
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
            <li className="flex justify-between mt-1">
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
            <li className="flex justify-between mt-1">
              <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                スタイル
              </p>
              <p className="flex-1">
                {boxer.style === 'orthodox' && 'オーソドックス'}
                {boxer.style === 'southpaw' && 'サウスポー'}
                {boxer.style === 'unknown' && '-'}
              </p>
            </li>
          </ul>
          {/* //? タイトル */}
          {Boolean(boxer.titles.length) && (
            <ul className="mt-3">
              {boxer.titles.map((title) => (
                <li
                  key={`${title.organization}_${title.weight}`}
                  className="mt-2"
                >
                  <p className="relative inline-block">
                    <span className="absolute top-[2px] left-[-23px] w-[18px] h-[18px] mr-2">
                      <img src={crown} alt="" />
                    </span>
                    {`${title.organization}世界${title.weight}級王者`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
