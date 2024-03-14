import clsx from 'clsx';
import { MatchDataType } from '@/assets/types';
import { useVisualModeController } from '@/hooks/useVisualModeController';
import { useWindowSize } from '@/hooks/useWindowSize';
import { VISUAL_MODE } from '@/store/visualModeState';
import { motion, AnimatePresence } from 'framer-motion';
// ! components
import { MatchCard } from '@/components/module/MatchCard';
import { SimpleMatchCard } from '@/components/module/SimpleMatchCard';
//!recoil
import { useRecoilState } from 'recoil';
import { boolState } from '@/store/boolState';

type PropsType = {
  beforeMatches: MatchDataType[];
  afterMatches: MatchDataType[];
  toMatchPage: (matchId: number) => void;
};
export const PcHome = ({ beforeMatches, toMatchPage, afterMatches }: PropsType) => {
  const [isShow, setIsShow] = useRecoilState(boolState('IS_SHOW_RESENT_MATCHES'));
  return (
    <>
      {!!beforeMatches.length && (
        <ul className={clsx('md:py-10')}>
          {beforeMatches.map((match) => (
            <li
              key={match.id}
              className="w-full h-full flex justify-center items-center px-2 pb-3 lg:mt-8 md:mt-5 first:mt-0"
            >
              <MatchBox match={match} onClick={toMatchPage} />
            </li>
          ))}
        </ul>
      )}

      {!!afterMatches.length && (
        <div className="md:pb-10">
          <div className=" flex justify-center">
            <div
              onClick={() => setIsShow(true)}
              className="w-full max-w-[1024px] bg-white rounded-sm py-4 text-neutral-800 text-xs text-center tracking-widest"
            >
              最新の過去試合
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
                      className="w-full h-full flex justify-center items-center px-2 pb-3 first:pt-3 lg:mt-8 md:mt-5"
                    >
                      <MatchBox match={match} onClick={toMatchPage} />
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

type MatchesViewPropsType = {
  match: MatchDataType;
  onClick: (matchId: number) => void;
};

const MatchBox = ({ match, onClick }: MatchesViewPropsType) => {
  const { state: visualMode } = useVisualModeController();
  const { device } = useWindowSize();

  if (device === 'SP' || visualMode === VISUAL_MODE.SIMPLE)
    return <SimpleMatchCard onClick={onClick} matchData={match} />;

  if (device === 'PC') return <MatchCard onClick={onClick} matchData={match} />;
};
