import React, { useEffect, useState, createContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_PATH } from '@/assets/routePath';

//! types
import { MatchDataType, MatchPredictionsType } from '@/assets/types';
// ! hook
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
import { useModalState } from '@/hooks/useModalState';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useLoading } from '@/hooks/useLoading';
import {
  useVoteMatchPrediction,
  useFetchUsersPrediction,
  useMatchPredictions,
} from '@/hooks/apiHooks/uesWinLossPrediction';
//! component
import { NewMatchComponent } from './NewMatchComponent';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

type PropsType = {
  matches: MatchDataType[] | undefined;
};

export const NewMatchContainer = (props: PropsType) => {
  //? urlからクエリmatch_idを取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get('match_id'));
  //? 勝敗予想投票実行時の状態hook
  const { isSuccess: isSuccessVoteMatchPrediction } = useVoteMatchPrediction();
  //? userの勝敗予想投票をすべて取得など…
  const { data: usersPredictions } = useFetchUsersPrediction();
  const { data: matchPredictions, refetch: refetchMatchPredictions } = useMatchPredictions(
    Number(matchId)
  );

  const { resetLoadingState } = useLoading();
  const navigate = useNavigate();
  const { device } = useWindowSize();

  const [thisMatch, setThisMatch] = useState<MatchDataType>();

  //? 試合の存在確認を確認、なければリダイレクト
  useEffect(() => {
    if (!props.matches) return;
    const match = props.matches?.find((match) => match.id === matchId);
    if (match) {
      setThisMatch(match);
    } else {
      navigate(ROUTE_PATH.HOME);
    }
  }, [matchId, props.matches]);

  //? userこの試合の勝敗予想の有無(falseは未投票、undefinedはデータ未取得状態)
  const [thisMatchPredictionByUser, setThisMatchPredictionByUser] = useState<UsersPredictionType>();

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
    if (isSuccessVoteMatchPrediction) {
      refetchMatchPredictions();
    }
  }, [isSuccessVoteMatchPrediction]);

  //? ↓↓↓voteIconの表示判定↓↓↓
  const [isShowVoteIcon, setIsShowVoteIcon] = useState(false);
  const { isDayOnFight, isDayAfterFight } = useDayOfFightChecker(thisMatch?.matchDate);
  useEffect(() => {
    // PC画面では表示させない
    if (device === 'PC') return setIsShowVoteIcon(false);
    // ユーザーの投票をfetch出来てない時は隠す
    if (usersPredictions === undefined) return setIsShowVoteIcon(false);
    // 過去の試合には表示しない
    if (isDayAfterFight === undefined || isDayAfterFight === true) return setIsShowVoteIcon(false);
    // 当日は表示しない
    if (isDayOnFight === undefined || isDayOnFight === true) return setIsShowVoteIcon(false);
    // ユーザーのこの試合への投票の有無で表示を決定させる
    const isVote = usersPredictions.some((obj) => obj.matchId === matchId);
    setIsShowVoteIcon(!isVote);
  }, [usersPredictions, isDayAfterFight, isDayOnFight, device]);
  //? ↑↑↑voteIconの表示判定↑↑↑

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
        <NewMatchComponent
          matchData={thisMatch}
          device={device}
          isShowPredictionModal={isShowPredictionModal}
          showPredictionModal={showPredictionModal}
          isVoteIconVisible={isShowVoteIcon}
        />
      </MatchContextWrapper>
    </>
  );
};

//? context
export type UsersPredictionType = 'red' | 'blue' | false | undefined;
export const UsersPredictionContext = createContext<UsersPredictionType>(undefined);

type MatchContextWrapperType = {
  children: React.ReactNode;
  thisMatchPredictionByUser: UsersPredictionType;
  matchPredictions: MatchPredictionsType | undefined;
};

export const MatchPredictionsContext = createContext<MatchPredictionsType | undefined>(undefined);

export const MatchContextWrapper = (props: MatchContextWrapperType) => {
  return (
    <MatchPredictionsContext.Provider value={props.matchPredictions}>
      <UsersPredictionContext.Provider value={props.thisMatchPredictionByUser}>
        {props.children}
      </UsersPredictionContext.Provider>
    </MatchPredictionsContext.Provider>
  );
};
