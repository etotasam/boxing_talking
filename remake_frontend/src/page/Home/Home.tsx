import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { flatten } from 'lodash';
// ! components
import { FightBox } from '@/components/module/FightBox';
import { SimpleFightBox } from '@/components/module/SimpleFightBox';
//! icon
import { VisualModeChangeIcon } from '@/components/atomic/VisualModeChangeIcon';
// ! hooks
import { useFetchMatches } from '@/hooks/useMatch';
import { usePagePath } from '@/hooks/usePagePath';
import { useLoading } from '@/hooks/useLoading';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useAllFetchMatchPredictionOfAuthUser } from '@/hooks/uesWinLossPrediction';
import { useVisualModeController } from '@/hooks/useVisualModeController';
// ! func
import { getFightDataOfPastDays } from '@/assets/functions';
//! types
import { MatchDataType } from '@/assets/types';

export const Home = () => {
  // ! use hook
  const { resetLoadingState } = useLoading();
  const { data: matchesData } = useFetchMatches();
  const { setter: setPagePath } = usePagePath();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { device } = useWindowSize();

  const { visualModeToggleSwitch } = useVisualModeController();

  const matchSelect = (matchId: number) => {
    navigate(`/match?match_id=${matchId}`);
  };
  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    //? ページpathをRecoilに保存
    setPagePath(pathname);
    return () => {
      resetLoadingState();
    };
  }, []);

  //? 試合データの並び替え
  const [formattedMatchesData, setFormattedMatchesData] =
    useState<MatchDataType[]>();
  useEffect(() => {
    if (!matchesData) return;
    const multipleArrayMatchData = matchesData.reduce(
      (accumulator: MatchDataType[][], current) => {
        const isFightPast = getFightDataOfPastDays(current);
        if (isFightPast) {
          return [[...accumulator[0]], [current, ...accumulator[1]]];
        } else {
          return [[...accumulator[0], current], [...accumulator[1]]];
        }
      },
      [[], []]
    );

    setFormattedMatchesData(flatten(multipleArrayMatchData));
  }, [matchesData]);

  return (
    <>
      {formattedMatchesData && (
        <>
          {device == 'PC' && (
            <div className="absolute top-0 left-[50%] translate-x-[-50%] lg:mt-3 mt-1">
              <VisualModeChangeIcon onClick={() => visualModeToggleSwitch()} />
            </div>
          )}

          <ul className="md:pt-10">
            {formattedMatchesData.map((match) => (
              <li
                key={match.id}
                className="w-full h-full flex justify-center items-center lg:mt-8 md:mt-5"
              >
                <MatchCard match={match} matchSelect={matchSelect} />
              </li>
            ))}
          </ul>

          {/* <div className="text-center md:my-10 my-5">
            <Link to="/past_matches">
              <button className="py-2 px-4 bg-stone-600 hover:bg-stone-800 duration-300 text-white rounded-sm sm:w-auto w-[95%]">
                その他過去の試合一覧
              </button>
            </Link>
          </div> */}
        </>
      )}
    </>
  );
};

type MatchesViewPropsType = {
  match: MatchDataType;
  matchSelect: (matchId: number) => void;
};

const MatchCard = ({ match, matchSelect }: MatchesViewPropsType) => {
  const { data: myAllPredictionVote } = useAllFetchMatchPredictionOfAuthUser();
  const { state: visualMode } = useVisualModeController();

  const [isPredictionVote, setIsPredictionVote] = useState<boolean>();

  useEffect(() => {
    if (myAllPredictionVote) {
      const bool = myAllPredictionVote.some((ob) => ob.match_id === match.id);
      setIsPredictionVote(bool);
    }
  }, [myAllPredictionVote]);
  const { device } = useWindowSize();

  if (device === 'SP' || visualMode === 'simple')
    return (
      <SimpleFightBox
        isPredictionVote={isPredictionVote}
        onClick={matchSelect}
        matchData={match}
      />
    );

  if (device === 'PC')
    return (
      <FightBox
        onClick={matchSelect}
        matchData={match}
        isPredictionVote={isPredictionVote}
      />
    );
};
