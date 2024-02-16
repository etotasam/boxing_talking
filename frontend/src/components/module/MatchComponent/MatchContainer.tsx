import React, { useEffect, useState, useRef, createContext } from 'react';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_PATH } from '@/assets/RoutePath';
//! types
import { MatchDataType } from '@/assets/types';
// ! hook
import { useModalState } from '@/hooks/useModalState';
import { useAuth, useGuest } from '@/hooks/apiHooks/useAuth';
import { useToastModal } from '@/hooks/useToastModal';
import { useLoading } from '@/hooks/useLoading';
import {
  useVoteMatchPrediction,
  useAllFetchMatchPredictionOfAuthUser,
} from '@/hooks/apiHooks/uesWinLossPrediction';
import { useWindowSize } from '@/hooks/useWindowSize';
import { usePostComment, useFetchComments } from '@/hooks/apiHooks/useComment';
//! recoil
import { useSetRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! component
import { MatchComponent } from './MatchComponent';
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from '@/assets/statusesOnToastModal';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

type PropsType = {
  matches: MatchDataType[] | undefined;
};

export const MatchContainer = (props: PropsType) => {
  //? window サイズの取得
  const { windowSize, device } = useWindowSize();
  //? urlからクエリmatch_idを取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const paramsMatchID = Number(query.get('match_id'));
  //? 勝敗予想投票実行時の状態hook
  const { isSuccess: isSuccessVoteMatchPrediction } = useVoteMatchPrediction();
  //? userの勝敗予想投票をすべて取得など…
  const { data: allPredictionVoteOfUsers, refetch: refetchAllPredictionData } =
    useAllFetchMatchPredictionOfAuthUser();
  const { setToastModal, showToastModal } = useToastModal();
  const { startLoading, resetLoadingState } = useLoading();
  const { isLoading: isFetchingComments } = useFetchComments(paramsMatchID);
  const navigate = useNavigate();
  const { data: isGuest } = useGuest();
  const { data: authUser } = useAuth();
  const isEitherAuth = Boolean(isGuest || authUser);
  const setRecoilPostCommentHeight = useSetRecoilState(
    elementSizeState('POST_COMMENT_HEIGHT')
  );

  //?ボクサー情報のセットと表示(modal)
  const { state: isBoxerInfoModal } = useModalState('BOXER_INFO');

  //?試合情報モーダルの表示状態
  const { state: isShowMatchInfoModal } = useModalState('MATCH_INFO');

  //? 勝敗予想投票モーダル
  const { state: isPredictionVoteModal } = useModalState('PREDICTION_VOTE');

  const {
    postComment,
    isSuccess: isSuccessPostComment,
    isLoading: isPostingComment,
  } = usePostComment();
  //? useState
  const [comment, setComment] = useState<string>();
  const [thisMatch, setThisMatch] = useState<MatchDataType>();

  //? 試合の存在確認を確認、なければリダイレクト
  useEffect(() => {
    if (!props.matches || !paramsMatchID) return;
    const match = props.matches?.find((match) => match.id === paramsMatchID);
    if (match) {
      setThisMatch(match);
    } else {
      navigate(ROUTE_PATH.HOME);
    }
  }, [paramsMatchID, props.matches]);

  //? userこの試合の勝敗予想の有無(falseは未投票、undefinedはデータ未取得状態)
  const [thisMatchPredictionByUser, setThisMatchPredictionByUser] =
    useState<ThisMatchPredictionByUserType>();

  //? 読み込み時にscrollをtop位置へ移動
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //? useRef
  const commentPostRef = useRef(null);
  const textareaRef = useRef(null);

  //? コメント入力Elementの高さの初期値をRecoilへ
  useEffect(() => {
    if (!commentPostRef.current) return;
    setRecoilPostCommentHeight(
      (commentPostRef.current as HTMLSelectElement).clientHeight
    );
  }, [commentPostRef.current]);

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
        (data) => data.match_id === Number(paramsMatchID)
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
  }, [allPredictionVoteOfUsers, paramsMatchID]);

  //? コメント投稿に成功したら投票してねモーダルを消す&勝敗予想を再取得
  useEffect(() => {
    if (isSuccessVoteMatchPrediction) {
      refetchAllPredictionData();
    }
  }, [isSuccessVoteMatchPrediction]);

  // ? コメント投稿成功時にコメント入力欄とその高さを初期化
  useEffect(() => {
    if (isSuccessPostComment) {
      setComment('');
      //? textareaの高さをリセットと中身を削除
      (textareaRef.current as unknown as HTMLTextAreaElement).style.height =
        'auto';
      (textareaRef.current as unknown as HTMLTextAreaElement).value = '';
    }
  }, [isSuccessPostComment]);

  //? コメント取得中にLoadingモーダル表示
  useEffect(() => {
    if (isFetchingComments) {
      startLoading();
    } else {
      resetLoadingState();
    }
  }, [isFetchingComments]);

  //? コメント投稿の実行
  const storeCommentExecute = () => {
    if (isPostingComment) return;
    if (!isEitherAuth) {
      setToastModal({
        message: MESSAGE.FAILED_POST_COMMENT_WITHOUT_AUTH,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }
    if (!comment) {
      setToastModal({
        message: MESSAGE.COMMENT_IS_EMPTY,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }
    postComment({ matchId: paramsMatchID, comment: comment });
    return;
  };

  const textarea = textareaRef.current as unknown as HTMLTextAreaElement;
  //?テキストエリアの高さを自動制御
  const autoExpandTextareaAndSetComment = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComment(e.target.value);
    if (!textarea) return;
    if (textarea.scrollHeight > 250) {
      textarea.style.height = 'auto';
      textarea.style.height = '250px';
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    //?コメント投稿入力Elementの高さをRecoilで管理
    setRecoilPostCommentHeight(
      (commentPostRef.current as unknown as HTMLSelectElement).clientHeight
    );
  };

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

  if (!windowSize) return;

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
          isPredictionVoteModal={isPredictionVoteModal}
          isBoxerInfoModal={isBoxerInfoModal}
          isShowMatchInfoModal={isShowMatchInfoModal}
          setComment={setComment}
          paramsMatchID={paramsMatchID}
          thisMatch={thisMatch}
          device={device}
          storeCommentExecute={storeCommentExecute}
          commentPostRef={commentPostRef}
          textareaRef={textareaRef}
          autoExpandTextareaAndSetComment={autoExpandTextareaAndSetComment}
        />
      </MatchContextWrapper>
    </>
  );
};

//? context
export type ThisMatchPredictionByUserType = 'red' | 'blue' | false | undefined;
export type IsThisMatchAfterTodayType = boolean | undefined;
export const ThisMatchPredictionByUserContext =
  createContext<ThisMatchPredictionByUserType>(undefined);
export const IsThisMatchAfterTodayContext =
  createContext<IsThisMatchAfterTodayType>(undefined);

type MatchContextWrapperType = {
  children: React.ReactNode;
  thisMatchPredictionByUser: ThisMatchPredictionByUserType;
  isThisMatchAfterToday: IsThisMatchAfterTodayType;
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
