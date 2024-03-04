import dayjs from 'dayjs';
// ! types
import { MatchDataType } from '@/assets/types';
// ! image
import crown from '@/assets/images/etc/champion.svg';
import clsx from 'clsx';
//! icons
import { HiArrowNarrowUp } from 'react-icons/hi';

// import crown from '@/assets/images/etc/crown.svg';

type MatchInfoBoxType = {
  matchData: MatchDataType;
};
export const MatchInfoBox = (props: MatchInfoBoxType) => {
  const { matchData } = props;
  const currentDate = dayjs();

  const redMatchCount = matchData.redBoxer.win + matchData.redBoxer.lose + matchData.redBoxer.draw;
  const blueMatchCount =
    matchData.blueBoxer.win + matchData.blueBoxer.lose + matchData.blueBoxer.draw;

  const isWinnerRed = matchData.result?.result === 'red';
  const isKo = matchData.result?.detail === 'ko' || matchData.result?.detail === 'tko';
  const isRedKo = isWinnerRed && isKo;
  const isBlueKo = !isWinnerRed && isKo;

  const boxerInfo = [
    {
      sub: '年齢',
      red: currentDate.diff(dayjs(matchData.redBoxer.birth), 'year'),
      blue: currentDate.diff(dayjs(matchData.blueBoxer.birth), 'year'),
    },
    {
      sub: '試合数',
      red: redMatchCount,
      blue: blueMatchCount,
    },
    {
      sub: 'KO率',
      red: `${Math.round((matchData.redBoxer.ko / redMatchCount) * 100)}%`,
      blue: `${Math.round((matchData.blueBoxer.ko / blueMatchCount) * 100)}%`,
    },
  ];
  return (
    <>
      <div className="w-full">
        <div className="border-y-2 border-white flex">
          <div className="bg-white text-black text-[26px] px-2 flex items-center">
            {dayjs(matchData.matchDate).format('YYYY.M.D')}
          </div>
          <div className="flex items-center pl-2">{matchData.venue}</div>
        </div>
        {!!matchData.titles.length && (
          <div className="text-center mt-3">
            {matchData.titles.map((title) => (
              <div
                key={title.organization}
                className="relative inline-block mr-5 last-of-type:mr-0 rounded-md"
              >
                <div className="w-[25px] h-[25px]">
                  <img src={crown} alt="crown" />
                </div>
                <span className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-white font-semibold shadow-blur">
                  {title.organization}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="text-[20px] text-center mt-3">
          <span className="mr-2">{matchData.weight}級</span>
          {matchData.grade}
        </div>

        {boxerInfo.map((info) => (
          <div key={info.sub} className="flex py-1 odd:bg-stone-400/10">
            <div
              className={clsx(
                'flex-1 flex items-center justify-center text-xl font-semibold',
                info.sub === 'KO率' && isRedKo && 'text-red-400'
              )}
            >
              <span className="relative">
                {((info.sub === 'KO率' && isRedKo) ||
                  (info.sub === '試合数' && !!matchData.result)) && (
                  <span
                    className={clsx(
                      'absolute top-[50%] left-[-10px] translate-x-[-50%] translate-y-[-50%] text-base',
                      info.sub === 'KO率' && isRedKo ? 'text-yellow-500' : 'text-stone-500'
                    )}
                  >
                    <HiArrowNarrowUp />
                  </span>
                )}
                {info.red}
              </span>
            </div>
            <div className="flex-1 text-xs text-stone-300 flex items-center justify-center">
              {info.sub}
            </div>
            <div
              className={clsx(
                'relative flex-1 flex items-center justify-center text-xl font-semibold',
                info.sub === 'KO率' && isBlueKo && 'text-red-400'
              )}
            >
              <span className="relative">
                {info.blue}
                {((info.sub === 'KO率' && isBlueKo) ||
                  (info.sub === '試合数' && !!matchData.result)) && (
                  <span
                    className={clsx(
                      'absolute top-[50%] right-[-25px] translate-x-[-50%] translate-y-[-50%] text-base',
                      info.sub === 'KO率' && isBlueKo ? 'text-yellow-500' : 'text-stone-500'
                    )}
                  >
                    <HiArrowNarrowUp />
                  </span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
