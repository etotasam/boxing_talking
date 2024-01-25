import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_PATH } from '@/assets/RoutePath';
// ! components
import { SimpleFightBox } from '@/components/module/SimpleFightBox';
//! hooks
import { useFetchPastMatches } from '@/hooks/apiHooks/useMatch';
import { useLoading } from '@/hooks/useLoading';
import { useAllFetchMatchPredictionOfAuthUser } from '@/hooks/apiHooks/uesWinLossPrediction';
//! types
import { MatchDataType } from '@/assets/types';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const PastMatches = () => {
  const { resetLoadingState } = useLoading();
  const { data: pastMatches } = useFetchPastMatches();
  const navigate = useNavigate();

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    return () => {
      resetLoadingState();
    };
  }, []);

  const matchSelect = (matchId: number) => {
    navigate(`${ROUTE_PATH.PAST_MATCH_SINGLE}?match_id=${matchId}`);
    // navigate(`${ROUTE_PATH.MATCH}?match_id=${matchId}`);
  };

  //? apiからデータが取得できてない時
  if (!pastMatches) return;

  //? 過去の試合が見つからない時
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

  //? 正常にデータ取得が完了した時
  return (
    <>
      <Helmet>
        <title>過去の試合 | {siteTitle}</title>
      </Helmet>
      {pastMatches && (
        <>
          <ul className="md:py-10">
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
      )}
    </>
  );
};

type MatchCardPropsType = {
  match: MatchDataType;
  matchSelect: (matchId: number) => void;
};

const MatchCard = ({ match, matchSelect }: MatchCardPropsType) => {
  const { data: usersAllPredictionVote } =
    useAllFetchMatchPredictionOfAuthUser();

  const [isPredictionVote, setIsPredictionVote] = useState<boolean>();

  //? ユーザの試合予想を取得
  useEffect(() => {
    if (usersAllPredictionVote) {
      const isPredictionThisMatch = usersAllPredictionVote.some(
        (ob) => ob.match_id === match.id
      );
      setIsPredictionVote(isPredictionThisMatch);
    }
  }, [usersAllPredictionVote]);

  return (
    <SimpleFightBox
      isPredictionVote={isPredictionVote}
      onClick={matchSelect}
      matchData={match}
    />
  );
};
