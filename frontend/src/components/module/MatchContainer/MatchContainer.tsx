import React, { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_PATH } from '@/assets/RoutePath';
//! types
import { MatchDataType } from '@/assets/types';
// ! hook
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
import { useSetRecoilState, useRecoilValue } from 'recoil';
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
  // ? use hook
  const { windowSize, device } = useWindowSize();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const paramsMatchID = Number(query.get('match_id'));
  const { isSuccess: isSuccessVoteMatchPrediction } = useVoteMatchPrediction();
  const { data: allPredictionVoteOfUsers, refetch: refetchAllPredictionData } =
    useAllFetchMatchPredictionOfAuthUser();
  const { setToastModal, showToastModal } = useToastModal();
  const { startLoading, resetLoadingState } = useLoading();
  const { isLoading: isFetchingComments } = useFetchComments(paramsMatchID);
  const navigate = useNavigate();
  const { data: isGuest } = useGuest();
  const { data: authUser } = useAuth();
  const isEitherAuth = Boolean(isGuest || authUser);
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const setRecoilPostCommentHeight = useSetRecoilState(
    elementSizeState('POST_COMMENT_HEIGHT')
  );

  const {
    postComment,
    isSuccess: isSuccessPostComment,
    isLoading: isPostingComment,
  } = usePostComment();
  //? useState
  const [comment, setComment] = useState<string>();
  const [thisMatch, setThisMatch] = useState<MatchDataType>();
  const [thisMatchPredictionCount, setThisMatchPredictionCount] = useState<
    Record<'redCount' | 'blueCount' | 'totalCount', number>
  >({ redCount: 0, blueCount: 0, totalCount: 0 });

  //? 試合の存在確認and試合の各データをthisMatch(useState)等にセット
  useEffect(() => {
    if (!props.matches || !paramsMatchID) return;
    const match = props.matches?.find((match) => match.id === paramsMatchID);
    if (match) {
      setThisMatch(match);
      setThisMatchPredictionCount({
        redCount: match.count_red,
        blueCount: match.count_blue,
        totalCount: match.count_red + match.count_blue,
      });
    } else {
      //試合が存在しない場合はリダイレクト
      navigate(ROUTE_PATH.HOME);
    }
  }, [paramsMatchID, props.matches]);

  const [thisMatchPredictionOfUsers, setThisMatchPredictionOfUsers] = useState<
    'red' | 'blue' | 'No prediction vote' | undefined
  >();

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
      if (thisMatchPredictionVote) {
        setThisMatchPredictionOfUsers(thisMatchPredictionVote.prediction);
        return;
      } else {
        setThisMatchPredictionOfUsers('No prediction vote');
        return;
      }
    } else {
      setThisMatchPredictionOfUsers(undefined);
      return;
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

      <MatchComponent
        isPostingComment={isPostingComment}
        setComment={setComment}
        paramsMatchID={paramsMatchID}
        thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
        thisMatch={thisMatch}
        thisMatchPredictionCount={thisMatchPredictionCount}
        isFetchingComments={isFetchingComments}
        isThisMatchAfterToday={isThisMatchAfterToday}
        device={device}
        headerHeight={headerHeight}
        storeCommentExecute={storeCommentExecute}
        commentPostRef={commentPostRef}
        textareaRef={textareaRef}
        autoExpandTextareaAndSetComment={autoExpandTextareaAndSetComment}
      />
    </>
  );
};
