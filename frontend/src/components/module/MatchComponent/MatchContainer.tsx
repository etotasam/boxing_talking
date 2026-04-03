import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_PATH } from '@/assets/routePath';

//! types
import { MatchDataType, MatchPredictionsType } from '@/types';
import { deviceState } from '@/store/deviceState';
//! contexts
import {
  UsersPredictionContext,
  MatchPredictionsContext,
  UsersPredictionType,
} from '@/contexts/MatchContext';
// ! hook
// import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
import { useVoteIconState } from '@/hooks/useVoteIconState';
import { useModalState } from '@/hooks/useModalState';
import {
  useVoteMatchPrediction,
  useFetchUsersPrediction,
  useMatchPredictions,
} from '@/hooks/apiHooks/uesWinLossPrediction';
import { useRecoilValue } from 'recoil';
//! component
import { MatchComponent } from './MatchComponent';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

type PropsType = {
  matches: MatchDataType[] | undefined;
};

export const MatchContainer = (props: PropsType) => {
  //? urlからクエリmatch_idを取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get('match_id'));
  //? 勝敗予想投票実行時の状態hook
  const { userPredictionPostState } = useVoteMatchPrediction();
  //? userの勝敗予想投票をすべて取得など…
  const { data: usersPredictions } = useFetchUsersPrediction();
  const { data: matchPredictions, refetch: refetchMatchPredictions } = useMatchPredictions(
    Number(matchId)
  );

  const navigate = useNavigate();
  const device = useRecoilValue(deviceState);

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

  //? userこの試合の勝敗予想の有無(falseは未投票、undefinedはデータ未取得状態)
  const [thisMatchPredictionByUser, setThisMatchPredictionByUser] = useState<UsersPredictionType>();
  //? 読み込み時にscrollをtop位置へ移動
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //? この試合の勝敗予想の有無とその投票
  useEffect(() => {
    //? 投票データの取得が完了しているかどうか。ログインしていない場合このデータは取得しない設定にしてる
    if (usersPredictions !== undefined) {
      const thisMatchPredictionVote = usersPredictions.find(
        (data) => data.matchId === Number(matchId)
      );

      //? 投票をしていない場合は'false'をセットする(undefinedはデータ未取得,falseは未投票)
      if (thisMatchPredictionVote) {
        setThisMatchPredictionByUser(thisMatchPredictionVote.prediction);
        return;
      } else {
        setThisMatchPredictionByUser(false);
        return;
      }
    }
  }, [usersPredictions, matchId]);

  //? コメント投稿に成功したら投票してねモーダルを消す&勝敗予想を再取得
  useEffect(() => {
    if (userPredictionPostState === 'success') {
      refetchMatchPredictions();
    }
  }, [userPredictionPostState]);

  //? vote iconの表示/非表示の判断
  const isShowVoteIconState = useVoteIconState({
    matchDate: thisMatch?.matchDate,
    id: thisMatch?.id,
  });

  const { state: isShowPredictionModal, showModal: showPredictionModal } =
    useModalState('PREDICTION_VOTE');

  // if (!windowSize) return;
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

      <MatchContextWrapper
        thisMatchPredictionByUser={thisMatchPredictionByUser}
        // isThisMatchAfterToday={isThisMatchAfterToday}
        matchPredictions={matchPredictions}
      >
        <MatchComponent
          matchData={thisMatch}
          device={device}
          isShowPredictionModal={isShowPredictionModal}
          showPredictionModal={showPredictionModal}
          isShowVoteIcon={isShowVoteIconState}
        />
      </MatchContextWrapper>
    </>
  );
};

//? context wrapper
type MatchContextWrapperType = {
  children: React.ReactNode;
  thisMatchPredictionByUser: UsersPredictionType;
  matchPredictions: MatchPredictionsType | undefined;
};

export const MatchContextWrapper = (props: MatchContextWrapperType) => {
  return (
    <MatchPredictionsContext.Provider value={props.matchPredictions}>
      <UsersPredictionContext.Provider value={props.thisMatchPredictionByUser}>
        {props.children}
      </UsersPredictionContext.Provider>
    </MatchPredictionsContext.Provider>
  );
};
