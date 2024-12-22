import clsx from 'clsx';
import { MatchDataType } from '@/assets/types';
import { motion, AnimatePresence } from 'framer-motion';
// ! components
import { SimpleMatchCard } from '@/components/module/SimpleMatchCard';
//!recoil
import { useRecoilState } from 'recoil';
import { boolState } from '@/store/boolState';
//! icons
import { FaArrowAltCircleDown } from 'react-icons/fa';
//! hooks
import { useWindowSize } from '@/hooks/useWindowSize';

type MatchesPropsType = {
  beforeMatches: MatchDataType[];
  afterMatches: MatchDataType[];
  toMatchPage: (matchId: number) => void;
};
export const Matches = ({ beforeMatches, toMatchPage, afterMatches }: MatchesPropsType) => {
  const [isShow, setIsShow] = useRecoilState(boolState('IS_SHOW_RESENT_MATCHES'));
  const { device } = useWindowSize();

  return (
    <>
      {!!beforeMatches.length && (
        <ul className={clsx('md:pt-10')}>
          {beforeMatches.map((match) => (
            <li
              key={match.id}
              className={clsx(
                'w-full h-full flex justify-center items-center pb-3 first:mt-0',
                device === 'SP' ? 'px-2' : 'px-0'
              )}
            >
              <SimpleMatchCard onClick={toMatchPage} matchData={match} />
            </li>
          ))}
        </ul>
      )}

      {!!afterMatches.length && (
        <div className="mt-5">
          <div className="flex justify-center">
            <div
              // onClick={() => setIsShow(true)}
              className={clsx(
                'relative w-full max-w-[1024px] md:w-[80%] text-white tracking-widest',
                device === 'SP' ? 'px-2' : 'px-0'
              )}
            >
              <p className="after:absolute after:top-[-10px] after:left-0 after:bg-white after:h-[1px] after:w-full">
                直近の試合
              </p>
            </div>
          </div>

          <div className="overflow-hidden md:mb-5">
            <ul>
              {afterMatches.map((match) => (
                <li
                  key={match.id}
                  className={clsx(
                    'w-full h-full flex justify-center items-center pb-3 first:pt-3',
                    device === 'SP' ? 'px-2' : 'px-0'
                  )}
                >
                  <SimpleMatchCard onClick={toMatchPage} matchData={match} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
