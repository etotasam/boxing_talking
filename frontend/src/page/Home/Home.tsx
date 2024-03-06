import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
import { VISUAL_MODE } from '@/store/visualModeState';
//! layout
import HeaderAndFooterLayout from '@/layout/HeaderAndFooterLayout';
// ! components
import { MatchCard } from '@/components/module/MatchCard';
import { SimpleMatchCard } from '@/components/module/SimpleMatchCard';
//! icon
import { VisualModeChangeButton } from '@/components/atomic/VisualModeChangeButton';
// ! hooks
import { useFetchMatches } from '@/hooks/apiHooks/useMatch';
import { useLoading } from '@/hooks/useLoading';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useVisualModeController } from '@/hooks/useVisualModeController';
import { useSortMatches } from '@/hooks/useSortMatches';
//! types
import { MatchDataType } from '@/assets/types';

export const Home = () => {
  // ! use hook
  const { resetLoadingState } = useLoading();
  const { data: matchesData } = useFetchMatches();
  const { beforeMatches, afterMatches } = useSortMatches(matchesData);
  const navigate = useNavigate();
  const { device } = useWindowSize();

  const { visualModeToggleSwitch } = useVisualModeController();

  const matchSelect = (matchId: number) => {
    navigate(`${ROUTE_PATH.MATCH}?match_id=${matchId}`);
  };
  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    return () => {
      resetLoadingState();
    };
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimationControls();
  const openPastMatches = () => {
    controls.start({ height: 'auto', opacity: 1 }).then(() => {
      setIsOpen(true);
    });
  };

  const closePastMatches = () => {
    controls.start({ height: 0, opacity: 0 }).then(() => {
      setIsOpen(false);
    });
  };

  const onClick = () => {
    if (isOpen) return closePastMatches();
    openPastMatches();
  };

  return (
    <>
      {device == 'PC' && (
        <div className="z-10 fixed top-[100px] lg:right-10 md:right-5 right-2">
          <VisualModeChangeButton onClick={() => visualModeToggleSwitch()} />
        </div>
      )}

      <HeaderAndFooterLayout>
        <>
          {!!beforeMatches.length && (
            <ul className={clsx('md:py-10')}>
              {beforeMatches.map((match) => (
                <li
                  key={match.id}
                  className="w-full h-full flex justify-center items-center lg:mt-8 md:mt-5 first:mt-0"
                >
                  <MatchBox match={match} onClick={matchSelect} />
                </li>
              ))}
            </ul>
          )}

          {!!afterMatches.length && (
            <>
              <div className="py-3 flex justify-center">
                <div className="w-[80%] bg-white rounded-lg py-4 text-neutral-800 text-xs text-center tracking-widest">
                  最新の過去試合
                </div>
              </div>

              <ul className={clsx('md:py-10')}>
                {afterMatches.map((match) => (
                  <li
                    key={match.id}
                    className="w-full h-full flex justify-center items-center lg:mt-8 md:mt-5 first:mt-0"
                  >
                    <MatchBox match={match} onClick={matchSelect} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      </HeaderAndFooterLayout>

      {/* <div className="text-center md:my-10 my-5">
        <Link
          className="inline-block py-2 px-4 bg-stone-600 hover:bg-stone-800 duration-300 text-white rounded-sm sm:w-auto w-[95%]"
          to={ROUTE_PATH.PAST_MATCHES}
        >
          その他過去の試合一覧
        </Link>
      </div> */}
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
