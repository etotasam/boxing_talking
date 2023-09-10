import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import clsx from "clsx";
import dayjs from "dayjs";

import { useRecoilValue } from "recoil";
import { loginModalSelector } from "@/store/loginModalState";
import { loadingSelector } from "@/store/loadingState";

//! types
import { MatchesDataType } from "@/assets/types";
// ! hook
import { useAuth } from "@/hooks/useAuth";
import { useToastModal } from "@/hooks/useToastModal";
import { useLoading } from "@/hooks/useLoading";
import { useFetchMatches } from "@/hooks/useMatch";
import { usePagePath } from "@/hooks/usePagePath";
import {
  usePostComment,
  useFetchComments,
  useDeleteComment,
} from "@/hooks/useComment";
//! component
import { EngNameWithFlag } from "@/components/atomc/EngNameWithFlag";
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from "@/assets/statusesOnToastModal";

export const Match = () => {
  const { pathname, search } = useLocation();
  const { data: matches } = useFetchMatches();

  const [comment, setComment] = useState<string>();
  const [commentPostComponentHeight, setCommentPostComponentHeight] =
    useState<number>();

  const query = new URLSearchParams(search);
  const paramsMatchID = Number(query.get("match_id"));

  const [selectedMatch, setSelectedMatch] = useState<MatchesDataType>();
  useEffect(() => {
    if (!matches || !paramsMatchID) return;
    const match = matches?.find((match) => match.id === paramsMatchID);
    setSelectedMatch(match);
  }, [paramsMatchID, matches]);
  // ! use hook
  const { setToastModal, showToastModal } = useToastModal();
  const { startLoading, resetLoadingState } = useLoading();
  const { data: comments, isLoading: isFetchingComments } =
    useFetchComments(paramsMatchID);
  const { setter: setPagePath } = usePagePath();
  const { data: authUser } = useAuth();
  const { deleteComment } = useDeleteComment();
  const {
    postComment,
    isSuccess: isSuccessPostComment,
    isLoading: isPostingComment,
    isError: isErrorPostComment,
  } = usePostComment();
  const commentPostRef = useRef(null);

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    //? ページpathをRecoilに保存
    setPagePath(pathname);
    return () => {
      resetLoadingState();
    };
  }, []);

  //? コメント投稿失敗時
  useEffect(() => {
    if (isErrorPostComment) {
      setToastModal({
        message: MESSAGE.COMMENT_POST_FAILED,
        bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR,
      });
      showToastModal();
    }
  }, [isErrorPostComment]);

  //? コメント入力欄の高さを取得
  useEffect(() => {
    if (commentPostRef) {
      if (commentPostRef.current) {
        setCommentPostComponentHeight(
          (commentPostRef.current as HTMLSelectElement).clientHeight
        );
      }
    }
  }, [comment]);

  //? コメント投稿中にモーダル表示
  useEffect(() => {
    if (isPostingComment) {
      startLoading();
    } else {
      resetLoadingState();
    }
  }, [isPostingComment]);

  // ? コメント投稿成功時にコメント入力欄をclearメッセージモーダル
  useEffect(() => {
    if (isSuccessPostComment) {
      setComment("");
      //? textareaの高さをリセットと中身を削除
      (textareaRef.current as unknown as HTMLTextAreaElement).style.height =
        "auto";
      (textareaRef.current as unknown as HTMLTextAreaElement).value = "";
      setToastModal({
        message: MESSAGE.COMMENT_POST_SUCCESS,
        bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS,
      });
      showToastModal();
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

  const sendComment = () => {
    if (!comment) {
      setToastModal({
        message: MESSAGE.COMMENT_IS_EMPTY,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }
    postComment({ matchId: paramsMatchID, comment });
  };
  const commentDelete = (commentID: number) => {
    deleteComment({ commentID, matchID: paramsMatchID });
  };

  const textareaRef = useRef(null);

  const autoExpandTextareaAndSetComment = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const textarea = textareaRef.current as unknown as HTMLTextAreaElement;
    if (!textarea) return;
    if (textarea.scrollHeight > 250) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    setComment(e.target.value);
  };

  //! テストデータ

  const red_vote = 5;
  const blue_vote = 2;
  const total = red_vote + blue_vote;
  const red = Math.ceil((red_vote / total) * 100);
  const blue = Math.ceil((blue_vote / total) * 100);

  return (
    <>
      {/* //? boxer */}
      {selectedMatch && (
        <section className="flex border-b-[1px] relative">
          {!isFetchingComments && (
            <>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${red}%` }}
                transition={{ duration: 1 }}
                // style={{ width: `${red}%` }}
                className="bolck absolute bottom-0 left-0 bg-red-400 h-[5px]"
              />
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${blue}%` }}
                transition={{ duration: 1 }}
                className="bolck absolute bottom-0 right-0 bg-blue-400 h-[5px]"
              />
            </>
          )}
          <div className="flex-1 py-5">
            <div className="flex flex-col justify-center items-center">
              <EngNameWithFlag
                boxerCountry={selectedMatch.red_boxer.country}
                boxerEngName={selectedMatch.red_boxer.eng_name}
              />
              <h2 className="text-[20px]">{selectedMatch.red_boxer.name}</h2>
            </div>
          </div>
          <div className="flex-1 py-5">
            <div className="flex flex-col justify-center items-center">
              <EngNameWithFlag
                boxerCountry={selectedMatch.blue_boxer.country}
                boxerEngName={selectedMatch.blue_boxer.eng_name}
              />
              <h2 className="text-[20px]">{selectedMatch.blue_boxer.name}</h2>
            </div>
          </div>
        </section>
      )}
      {/* //? comments */}
      {comments && comments.length >= 1 ? (
        <section style={{ marginBottom: `${commentPostComponentHeight}px` }}>
          <AnimatePresence>
            {comments.map((commentData) => (
              <motion.div
                // layout
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                key={commentData.id}
                className={clsx("p-5 border-b-[1px] border-stone-200")}
              >
                <p
                  className="text-[18px] text-stone-600"
                  dangerouslySetInnerHTML={{
                    __html: commentData.comment,
                  }}
                />
                <div className="flex mt-3">
                  <time className="text-sm leading-[24px] text-stone-500">
                    {dayjs(commentData.created_at).format("YYYY/MM/DD HH:mm")}
                  </time>
                  <p className="text-ms ml-3 text-stone-600">
                    {commentData.post_user_name}
                  </p>
                </div>
                {/* //? ゴミ箱 */}
                {authUser && authUser.name === commentData.post_user_name && (
                  <button
                    onClick={() => commentDelete(commentData.id)}
                    className="bg-blue-300 px-3 py-1"
                  >
                    ゴミ箱
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      ) : (
        !isFetchingComments && (
          <div className="w-full text-center mt-[50px] text-[18px]">
            まだコメントはありません
          </div>
        )
      )}

      <section
        ref={commentPostRef}
        className="fixed bottom-0 w-full flex bg-white/60 justify-center py-8 border-t-[1px] border-stone-200"
      >
        <div className="w-[70%] max-w-[800px]">
          <PostCommentTextarea
            setComment={setComment}
            comment={comment}
            sendComment={sendComment}
            textareaRef={textareaRef}
            autoExpandTextareaAndSetComment={autoExpandTextareaAndSetComment}
          />
        </div>
      </section>
    </>
  );
};

type PostCommentTextareaType = {
  setComment: React.Dispatch<React.SetStateAction<string | undefined>>;
  sendComment: () => void;
  comment: string | undefined;
  textareaRef: React.MutableRefObject<null>;
  autoExpandTextareaAndSetComment: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

// ! post commnet textarea
const PostCommentTextarea = ({
  sendComment,
  textareaRef,
  autoExpandTextareaAndSetComment,
}: PostCommentTextareaType) => {
  return (
    <div className="border-stone-400 bg-white relative border-[1px] pl-3 py-2 rounded-sm flex justify-center items-center">
      <textarea
        ref={textareaRef}
        className="w-full resize-none outline-0 leading-[28px] pr-[100px] bg-white"
        placeholder="コメント投稿..."
        wrap={"hard"}
        name=""
        id=""
        rows={1}
        onChange={autoExpandTextareaAndSetComment}
      ></textarea>
      <button
        onClick={sendComment}
        className="absolute bottom-[7px] text-[14px] right-[10px] border-[1px] bg-stone-600 py-1 text-white pl-4 pr-3 tracking-[0.4em]"
      >
        送信
      </button>
    </div>
  );
};
