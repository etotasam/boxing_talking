import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PostComment } from './PostComment';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { deviceState } from '@/store/deviceState';
import { useLocation } from 'react-router-dom';
import { MESSAGE } from '@/constants/statusesOnToastModal';
//! hooks
import { useToastModal } from '@/hooks/useToastModal';
import { usePostComment } from '@/hooks/apiHooks/comment';
import { useAuth, useGuest } from '@/hooks/apiHooks/auth';

export const PostCommentContainer = () => {
  //? urlからクエリmatch_idを取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get('match_id'));

  const { data: isGuest } = useGuest();
  const { data: authUser } = useAuth();
  const isAuthOrGuest = Boolean(isGuest || authUser);

  const setRecoilPostCommentHeight = useSetRecoilState(elementSizeState('POST_COMMENT_HEIGHT'));

  const { showNoticeToast } = useToastModal();
  const [comment, setComment] = useState<string>();

  const { postComment, commentPostState } = usePostComment();

  const device = useRecoilValue(deviceState);
  const commentPostEl = useRef<HTMLDivElement>();
  //? deviceのサイズが変わるとcommentPostElementの高さも変わる様になってるから依存関係に"device"を入れてるよ
  const commentPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (node) {
        commentPostEl.current = node;
        //? コメント入力Elementの高さの初期値をRecoilへ
        setRecoilPostCommentHeight(node.clientHeight);
      }
    },
    [device]
  );

  const textareaRef = useRef(null);
  const textarea = textareaRef.current as unknown as HTMLTextAreaElement;
  //?テキストエリアの高さを自動制御
  const textareaMaxHeight = 250;
  const autoExpandTextareaAndSetComment = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    if (!textarea) return;
    if (textarea.scrollHeight > textareaMaxHeight) {
      textarea.style.height = 'auto'; // 一度`auto`にしないとうまく動かない
      textarea.style.height = `${textareaMaxHeight}px`;
      return;
    }
    textarea.style.height = 'auto'; // 一度`auto`にしないとうまく動かない
    textarea.style.height = `${textarea.scrollHeight}px`;
    //?コメント投稿入力Elementの高さをRecoilで管理
    setRecoilPostCommentHeight((commentPostEl.current as HTMLDivElement).clientHeight);
  };

  // ? コメント投稿成功時にコメント入力欄とその高さを初期化
  useEffect(() => {
    if (commentPostState === 'success') {
      setComment('');
      //? textareaの高さをリセットと中身を削除
      (textareaRef.current as unknown as HTMLTextAreaElement).style.height = 'auto';
      (textareaRef.current as unknown as HTMLTextAreaElement).value = '';
    }
    //? postCommentの高さを初期化
    setRecoilPostCommentHeight((commentPostEl.current as HTMLDivElement).clientHeight);
  }, [commentPostState]);

  //? コメント投稿の実行
  const storeCommentExecute = () => {
    if (commentPostState === 'loading') return;
    if (!isAuthOrGuest) {
      showNoticeToast(MESSAGE.FAILED_POST_COMMENT_WITHOUT_AUTH);
      return;
    }
    if (!comment) {
      showNoticeToast(MESSAGE.COMMENT_IS_EMPTY);
      return;
    }
    postComment({ matchId: matchId, comment: comment });
    return;
  };

  const handleProps = {
    commentPostRef,
    setComment,
    storeCommentExecute,
    textareaRef,
    autoExpandTextareaAndSetComment,
  };
  return <PostComment {...handleProps} />;
};
