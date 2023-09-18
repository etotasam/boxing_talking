import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { flatten } from 'lodash';
// ! components
import { FightBox } from '@/components/module/FightBox';
import { SimpleFightBox } from '@/components/module/SimpleFightBox';
import { Footer } from '@/components/module/Footer';
//! icon
import { VisualModeChangeIcon } from '@/components/atomc/VisualModeChangeIcon';
// ! hooks
import { useFetchMatches } from '@/hooks/useMatch';
import { usePagePath } from '@/hooks/usePagePath';
import { useLoading } from '@/hooks/useLoading';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import { useFooterHeight } from '@/hooks/useFooterHeight';
import { useAllFetchMatchPredictionOfAuthUser } from '@/hooks/uesWinLossPredition';
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

  const { state: headerHeight } = useHeaderHeight();
  const { state: footerHeight } = useFooterHeight();
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
      (accum: MatchDataType[][], current) => {
        const isFightPast = getFightDataOfPastDays(current);
        if (isFightPast) {
          return [[...accum[0]], [current, ...accum[1]]];
        } else {
          return [[...accum[0], current], [...accum[1]]];
        }
      },
      [[], []]
    );

    setFormattedMatchesData(flatten(multipleArrayMatchData));
  }, [matchesData]);

  return (
    <>
      <div
        className="md:py-10 pb-5 relative"
        style={{
          minHeight: `calc(100vh - (${headerHeight}px + ${footerHeight}px) - 1px)`,
        }}
      >
        {device == 'PC' && (
          <div className="absolute top-0 left-[50%] translate-x-[-50%] lg:mt-3 mt-1">
            <VisualModeChangeIcon onClick={() => visualModeToggleSwitch()} />
          </div>
        )}

        <ul>
          {formattedMatchesData &&
            formattedMatchesData.map((match) => (
              <li
                key={match.id}
                className="w-full h-full flex justify-center items-center lg:mt-8 md:mt-5"
              >
                <MatchCard match={match} matchSelect={matchSelect} />
              </li>
            ))}
        </ul>
      </div>

      <Footer />
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
  // console.log(myAllPredictionVote);
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
