import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_PATH } from '@/assets/RoutePath';
// ! components
import { FightBox } from '@/components/module/FightBox';
import { SimpleFightBox } from '@/components/module/SimpleFightBox';
//! hooks
import { useFetchPastMatches } from '@/hooks/useMatch';
import { usePagePath } from '@/hooks/usePagePath';
import { useLoading } from '@/hooks/useLoading';
import { useVisualModeController } from '@/hooks/useVisualModeController';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useAllFetchMatchPredictionOfAuthUser } from '@/hooks/uesWinLossPrediction';
//! icon
import { VisualModeChangeIcon } from '@/components/atomic/VisualModeChangeIcon';
//! types
import { MatchDataType } from '@/assets/types';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const PastMatches = () => {
  const { setter: setPagePath } = usePagePath();
  const { resetLoadingState } = useLoading();
  const { visualModeToggleSwitch } = useVisualModeController();
  const { device } = useWindowSize();
  const { pathname } = useLocation();
  const { data: pastMatches } = useFetchPastMatches();
  const navigate = useNavigate();
  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    //? ページpathをRecoilに保存
    setPagePath(pathname);
    return () => {
      resetLoadingState();
    };
  }, []);

  const matchSelect = (matchId: number) => {
    navigate(`${ROUTE_PATH.MATCH}?match_id=${matchId}`);
  };

  if (!pastMatches) return;
  if (pastMatches && Boolean(!pastMatches.length))
    return (
      <>
        <Helmet>
          <title>過去の試合 | {siteTitle}</title>
        </Helmet>
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          <div>過去の試合が見つかりませんでした</div>
        </div>
      </>
    );
  return (
    <>
      <Helmet>
        <title>過去の試合 | {siteTitle}</title>
      </Helmet>
      {device == 'PC' && (
        <div className="absolute top-0 left-[50%] translate-x-[-50%] lg:mt-3 mt-1">
          <VisualModeChangeIcon onClick={() => visualModeToggleSwitch()} />
        </div>
      )}

      <ul>
        {pastMatches.map((match) => (
          <li
            key={match.id}
            className="w-full h-full flex justify-center items-center lg:mt-8 md:mt-5"
          >
            <MatchCard match={match} matchSelect={matchSelect} />
          </li>
        ))}
      </ul>
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
