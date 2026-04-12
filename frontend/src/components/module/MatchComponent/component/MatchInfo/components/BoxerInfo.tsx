import { ComponentProps } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useRecoilValue } from 'recoil';
//! type
import { BoxerType, MatchResultType } from '@/types';
import { BOXER_STANCE_LABELS } from '@/assets/boxerData';
//! components
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
//! recoil
import { deviceState } from '@/store/deviceState';
//! image
import crown from '@/assets/images/etc/champion.svg';
import fallOfCrown from '@/assets/images/etc/fall_champion.svg';

type BoxerWithColor = BoxerType & { color: 'red' | 'blue' };

type BoxerInfoPropsType = ComponentProps<'div'> & {
  boxer: BoxerWithColor;
  matchResult?: MatchResultType | null;
  matchDate: string;
};

export const BoxerInfo = (props: BoxerInfoPropsType) => {
  const { className, boxer, matchResult = null, matchDate } = props;
  const device = useRecoilValue(deviceState);
  return (
    <div className={clsx('w-full h-full flex justify-center', className)}>
      <div className={clsx('text-center w-full py-5', device === 'PC' ? 'px-5' : 'px-2')}>
        <BoxerName boxer={boxer} />
        <BoxerRecord boxer={boxer} matchResult={matchResult} />
        <BoxerStatus boxer={boxer} matchDate={matchDate} />
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

const BoxerStatus = ({ boxer, matchDate }: { boxer: BoxerType; matchDate: string }) => {
  const currentDate = dayjs();
  const targetDate = currentDate.isBefore(dayjs(matchDate)) ? currentDate : dayjs(matchDate);

  return (
    <ul className="mt-5 font-clamp-level-1">
      <li className="flex justify-between">
        <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">年齢</p>
        <p className="flex-1">{targetDate.diff(dayjs(boxer.birth), 'year')}</p>
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
        <p className="flex-1">{BOXER_STANCE_LABELS[boxer.style]}</p>
      </li>
    </ul>
  );
};

type BoxerRecordType = {
  boxer: BoxerWithColor;
  matchResult: MatchResultType | null;
};

const BoxerRecord = (props: BoxerRecordType) => {
  const { boxer, matchResult } = props;
  const result = matchResult?.result ?? false;
  const isKo = matchResult?.detail
    ? matchResult.detail === 'ko' || matchResult.detail === 'tko'
    : false;
  const resultState = getResultState({ result, boxerColor: boxer.color });

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
          "relative flex-1 bg-stone-800 before:content-['LOSS'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm",
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

const getResultState = ({
  result,
  boxerColor,
}: {
  result: MatchResultType['result'] | false;
  boxerColor: BoxerWithColor['color'];
}): 'win' | 'loss' | 'draw' | null => {
  if (result === boxerColor) return 'win';
  if (result === 'draw') return 'draw';
  if (result && result !== 'no-contest') return 'loss';
  return null;
};

const Titles = ({ titles }: Pick<BoxerType, 'titles'>) => {
  return (
    <>
      {Boolean(titles.length) && (
        <ul className="mt-1">
          {titles.map((title) => (
            <li key={`${title.organization}_${title.weight}`} className="">
              <p
                className={clsx(
                  'font-clamp-level-0 relative inline-block',
                  (title.state === 'new' || title.state === null) && 'text-yellow-500',
                  title.state === 'still' && 'text-blue-500',
                  title.state === 'fall' && 'text-stone-500'
                )}
              >
                <span className="absolute top-[50%] translate-y-[-50%] left-[-25px] w-[20px] h-[20px]">
                  {title.state === 'fall' ? (
                    <img src={fallOfCrown} alt="" />
                  ) : title.state === 'new' ? (
                    <>
                      <img src={crown} alt="" />
                      <span className="absolute top-[3px] left-[-3px] text-white">New</span>
                    </>
                  ) : (
                    <img src={crown} alt="" />
                  )}
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
