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

type PropsType = {
  beforeMatches: MatchDataType[];
  afterMatches: MatchDataType[];
  toMatchPage: (matchId: number) => void;
};
export const SpHome = ({ beforeMatches, toMatchPage, afterMatches }: PropsType) => {
  const [isShow, setIsShow] = useRecoilState(boolState('IS_SHOW_RESENT_MATCHES'));

  return (
    <>
      {!!beforeMatches.length && (
        <ul className={clsx('md:py-10')}>
          {beforeMatches.map((match) => (
            <li
              key={match.id}
              className="w-full h-full flex justify-center items-center px-2 pb-3 first:mt-0"
            >
              <SimpleMatchCard onClick={toMatchPage} matchData={match} />
            </li>
          ))}
        </ul>
      )}

      {!!afterMatches.length && (
        <div className="">
          <div className="flex justify-center">
            <div
              onClick={() => setIsShow(true)}
              className="flex items-center justify-center w-full bg-white rounded-sm py-4 text-neutral-800 text-xs text-center tracking-widest"
            >
              <p className="inline-block">最新の過去試合</p>
              <motion.div
                animate={{ y: isShow ? 0 : [0, -3] }}
                transition={{
                  duration: 0.4,
                  repeat: isShow ? 0 : Infinity,
                  repeatType: 'reverse',
                  type: 'spring',
                  bounce: 0.25,
                }}
                className='className="ml-1"'
              >
                <FaArrowAltCircleDown />
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {isShow && (
              <div className="overflow-hidden md:mb-5">
                <motion.ul
                  layout
                  initial={{ y: '-100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '-100%' }}
                  transition={{ duration: 0.4 }}
                  className={clsx('md:py-0')}
                >
                  {afterMatches.map((match) => (
                    <li
                      key={match.id}
                      className="w-full h-full flex justify-center items-center px-2 pb-3 first:pt-3"
                    >
                      <SimpleMatchCard onClick={toMatchPage} matchData={match} />
                    </li>
                  ))}
                </motion.ul>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};
