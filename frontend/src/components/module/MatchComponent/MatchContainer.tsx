import React, { useEffect, useState, createContext } from 'react';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_PATH } from '@/assets/routePath';
//! types
import { MatchDataType } from '@/assets/types';
// ! hook
import { useModalState } from '@/hooks/useModalState';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useLoading } from '@/hooks/useLoading';
import {
  useVoteMatchPrediction,
  useAllFetchMatchPredictionOfAuthUser,
} from '@/hooks/apiHooks/uesWinLossPrediction';
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
  const { isSuccess: isSuccessVoteMatchPrediction } = useVoteMatchPrediction();
  //? userの勝敗予想投票をすべて取得など…
  const { data: allPredictionVoteOfUsers, refetch: refetchAllPredictionData } =
    useAllFetchMatchPredictionOfAuthUser();
  const { resetLoadingState } = useLoading();
  const navigate = useNavigate();
  const { device } = useWindowSize();

  const [thisMatch, setThisMatch] = useState<MatchDataType>();

  //? 試合の存在確認を確認、なければリダイレクト
  useEffect(() => {
    if (!props.matches || !matchId) return;
    const match = props.matches?.find((match) => match.id === matchId);
    if (match) {
      setThisMatch(match);
    } else {
      navigate(ROUTE_PATH.HOME);
    }
  }, [matchId, props.matches]);

  //? userこの試合の勝敗予想の有無(falseは未投票、undefinedはデータ未取得状態)
  const [thisMatchPredictionByUser, setThisMatchPredictionByUser] =
    useState<ThisMatchPredictionByUserType>();

  //? 読み込み時にscrollをtop位置へ移動
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    return () => {
      resetLoadingState();
    };
  }, []);

  //? この試合の勝敗予想の有無とその投票
  useEffect(() => {
    //? 投票データの取得が完了しているかどうか。ログインしていない場合このデータは取得しない設定にしてる
    if (allPredictionVoteOfUsers !== undefined) {
      const thisMatchPredictionVote = allPredictionVoteOfUsers.find(
        (data) => data.match_id === Number(matchId)
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
  }, [allPredictionVoteOfUsers, matchId]);

  //? コメント投稿に成功したら投票してねモーダルを消す&勝敗予想を再取得
  useEffect(() => {
    if (isSuccessVoteMatchPrediction) {
      refetchAllPredictionData();
    }
  }, [isSuccessVoteMatchPrediction]);

  //? 試合の日が当日以降かどうか
  const [isThisMatchAfterToday, setIsThisMatchAfterToday] = useState<boolean>();
  useEffect(() => {
    if (!thisMatch) return;
    const todaySubtractOneSecond = dayjs().startOf('day').add(1, 'second');
    const isAfterToday = dayjs(thisMatch.match_date).isAfter(
      todaySubtractOneSecond
    );
    setIsThisMatchAfterToday(isAfterToday);
  }, [thisMatch]);

  const { state: isShowPredictionModal } = useModalState('PREDICTION_VOTE');

  // if (!windowSize) return;
  if (!thisMatch) return;
  return (
    <>
      <Helmet>
        {thisMatch ? (
          <title>
            {thisMatch?.red_boxer.name} vs {thisMatch?.blue_boxer.name} |{' '}
            {siteTitle}
          </title>
        ) : (
          <title> The Match | {siteTitle}</title>
        )}
      </Helmet>

      <MatchContextWrapper
        thisMatchPredictionByUser={thisMatchPredictionByUser}
        isThisMatchAfterToday={isThisMatchAfterToday}
      >
        <MatchComponent
          matchData={thisMatch}
          device={device}
          isShowPredictionModal={isShowPredictionModal}
        />
      </MatchContextWrapper>
    </>
  );
};

//? context
export type ThisMatchPredictionByUserType = 'red' | 'blue' | false | undefined;
export const ThisMatchPredictionByUserContext =
  createContext<ThisMatchPredictionByUserType>(undefined);
export const IsThisMatchAfterTodayContext = createContext<boolean | undefined>(
  undefined
);

type MatchContextWrapperType = {
  children: React.ReactNode;
  thisMatchPredictionByUser: ThisMatchPredictionByUserType;
  isThisMatchAfterToday: boolean | undefined;
};

export const MatchContextWrapper = (props: MatchContextWrapperType) => {
  return (
    <ThisMatchPredictionByUserContext.Provider
      value={props.thisMatchPredictionByUser}
    >
      <IsThisMatchAfterTodayContext.Provider
        value={props.isThisMatchAfterToday}
      >
        {props.children}
      </IsThisMatchAfterTodayContext.Provider>
    </ThisMatchPredictionByUserContext.Provider>
  );
};
