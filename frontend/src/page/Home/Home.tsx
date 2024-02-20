import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
import { VISUAL_MODE } from '@/store/visualModeState';
// ! components
import { FightBox } from '@/components/module/FightBox';
import { SimpleFightBox } from '@/components/module/SimpleFightBox';
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
  const { sortedMatches } = useSortMatches(matchesData);
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

  if (!sortedMatches) return;

  return (
    <>
      {device == 'PC' && (
        <div className="z-10 fixed top-[100px] lg:right-10 md:right-5 right-2">
          <VisualModeChangeButton onClick={() => visualModeToggleSwitch()} />
        </div>
      )}

      <ul className="md:py-10">
        {sortedMatches.map((match) => (
          <li
            key={match.id}
            className="w-full h-full flex justify-center items-center lg:mt-8 md:mt-5 first:mt-0"
          >
            <MatchCard match={match} matchSelect={matchSelect} />
          </li>
        ))}
      </ul>

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
  matchSelect: (matchId: number) => void;
};

const MatchCard = ({ match, matchSelect }: MatchesViewPropsType) => {
  const { state: visualMode } = useVisualModeController();
  const { device } = useWindowSize();

  if (device === 'SP' || visualMode === VISUAL_MODE.SIMPLE)
    return <SimpleFightBox onClick={matchSelect} matchData={match} />;

  if (device === 'PC')
    return <FightBox onClick={matchSelect} matchData={match} />;
};
