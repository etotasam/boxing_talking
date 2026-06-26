import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_PATH } from '@/constants/routePath';

import { MatchDataType } from '@/types';
import { useVoteIconState } from '@/hooks/useVoteIconState';
import { useModalState } from '@/hooks/useModalState';
import {
  useFetchUsersPrediction,
  useMatchPredictions,
} from '@/hooks/apiHooks/prediction';
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { MatchView, UsersPredictionType } from './MatchView';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

type PropsType = {
  matches: MatchDataType[] | undefined;
};

export const MatchContainer = (props: PropsType) => {
  //? urlからクエリmatch_idを取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get('match_id'));
  //? userの勝敗予想投票をすべて取得など…
  const { data: usersPredictions } = useFetchUsersPrediction();

  const navigate = useNavigate();
  const commentsModalHeightHiddenState =
    useRecoilValue(elementSizeState('COMMENTS_MODAL_HIDDEN_HEIGHT')) ?? 0;

  const thisMatch = useMemo(
    () => props.matches?.find((match) => match.id === matchId),
    [props.matches, matchId]
  );
  //? 試合の存在確認を確認、なければリダイレクト
  useEffect(() => {
    if (props.matches && !thisMatch) {
      navigate(ROUTE_PATH.HOME);
    }
  }, [props.matches, thisMatch]);

  const userPrediction = useMemo<UsersPredictionType>(() => {
    if (usersPredictions === undefined) return undefined;

    const matchPrediction = usersPredictions.find((data) => data.matchId === matchId);

    return matchPrediction ? matchPrediction.prediction : false;
  }, [usersPredictions, matchId]);

  const {
    data: matchPredictions,
    matchPredictionFetchState,
  } = useMatchPredictions(Number(matchId), userPrediction);

  //? 読み込み時にscrollをtop位置へ移動
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //? vote iconの表示/非表示の判断
  const isShowVoteIconState = useVoteIconState({
    matchDate: thisMatch?.matchDate,
    id: thisMatch?.id,
  });

  const { state: isShowPredictionModal, showModal: showPredictionModal } =
    useModalState('PREDICTION_VOTE');

  if (!thisMatch) return;
  return (
    <>
      <Helmet>
        {thisMatch ? (
          <title>
            {thisMatch?.redBoxer.name} vs {thisMatch?.blueBoxer.name} | {siteTitle}
          </title>
        ) : (
          <title> The Match | {siteTitle}</title>
        )}
      </Helmet>
      <MatchView
        matchData={thisMatch}
        userPrediction={userPrediction}
        matchPredictions={matchPredictions}
        isMatchPredictionsLoading={matchPredictionFetchState === 'loading'}
        isShowPredictionModal={isShowPredictionModal}
        showPredictionModal={showPredictionModal}
        isShowVoteIcon={isShowVoteIconState}
        commentsModalHeightHiddenState={commentsModalHeightHiddenState}
      />
    </>
  );
};
