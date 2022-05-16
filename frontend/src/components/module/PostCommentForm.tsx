import React, { useEffect } from "react";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";
//! components
import { SpinnerModal } from "@/components/modal/SpinnerModal";
//! hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { usePostComment } from "@/libs/hooks/useComment";
import { useQueryState } from "@/libs/hooks/useQueryState";

export const PostCommentForm = ({ matchId }: { matchId: number }) => {
  const { data: authUser } = useAuth();
  const {
    postComment,
    isLoading: isPostingComment,
    isSuccess: isSuccessPostComment,
  } = usePostComment();
  const { setToastModalMessage } = useToastModal();
  const [comment, setComment] = React.useState<string>("");

  //? isLoading: isPostingComment,を外で使いたいのでuseQueryStateで共有
  const { setter } = useQueryState<boolean>("q/isPostingComment");
  useEffect(() => {
    setter(isPostingComment);
  }, [isPostingComment]);

  //? コメントの投稿
  const post = async () => {
    if (!authUser) return;
    setToastModalMessage({ message: MESSAGE.NULL, bgColor: ModalBgColorType.NULL });
    if (comment === "") {
      setToastModalMessage({
        message: MESSAGE.COMMENT_POST_NULL,
        bgColor: ModalBgColorType.NOTICE,
      });
      return;
    }
    postComment({ userId: authUser.id, matchId, comment });
  };

  const divRef = React.useRef(null);
  //? コメント投稿が成功した時
  useEffect(() => {
    if (!isSuccessPostComment) return;
    setComment("");
    const commentDiv = divRef.current! as HTMLDivElement;
    commentDiv.innerText = "";
  }, [isSuccessPostComment]);

  //? 投稿コメントをセットする
  const commentEl = React.useRef(comment);
  const commentInput = (e: React.FormEvent<HTMLDivElement>) => {
    const commentDiv = e.target as HTMLDivElement;
    setComment(commentDiv.innerText);
  };

  const [isFocus, setIsFocus] = React.useState(false);

  return (
    <div className="w-full flex justify-center">
      <div className={`w-[80%] flex items-end`}>
        <div
          ref={divRef}
          className={`w-full pl-3 pr-10 py-1 rounded outline-none text-stone-600 duration-300 ${
            isFocus || comment ? `bg-white` : `bg-stone-300`
          }`}
          contentEditable
          onInput={commentInput}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          dangerouslySetInnerHTML={{ __html: commentEl.current }}
        ></div>
        <div className="relative w-[80px] ml-3">
          <button
            onClick={post}
            className="border rounded bg-stone-400 hover:bg-stone-700 focus:bg-stone-700 duration-300 text-stone-50 px-3 w-full h-[34px]"
          >
            送信
          </button>
          {isPostingComment && <SpinnerModal />}
        </div>
      </div>
    </div>
  );
};
