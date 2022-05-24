import React, { useEffect } from "react";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";
//! components
import { Spinner } from "@/components/module/Spinner";
//! hooks
import { useAuth, UserType } from "@/libs/hooks/useAuth";
import { usePostComment } from "@/libs/hooks/useComment";
import { useQueryState } from "@/libs/hooks/useQueryState";

export const PostCommentForm = ({ matchId }: { matchId: number }) => {
  const { data: authUser } = useAuth();
  const {
    postComment,
    isLoading: isPostingComment,
    isSuccess: isSuccessPostComment,
  } = usePostComment();
  const { setToastModalMessage, clearToastModaleMessage } = useToastModal();
  const [comment, setComment] = React.useState<string>("");

  //? isLoading: isPostingComment,を外で使いたいのでuseQueryStateで共有
  const { setter } = useQueryState<boolean>("q/isPostingComment");
  useEffect(() => {
    setter(isPostingComment);
  }, [isPostingComment]);

  //? コメントの投稿
  const post = async () => {
    // if (!authUser) return;
    const userId = authUser ? authUser.id : null;
    clearToastModaleMessage();
    if (comment === "") {
      setToastModalMessage({
        message: MESSAGE.COMMENT_POST_NULL,
        bgColor: ModalBgColorType.NOTICE,
      });
      return;
    }
    postComment({ userId: userId, matchId, comment });
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
      <div className={`w-[90%] md:w-[80%] flex items-end`}>
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
            className={`border rounded duration-300 text-stone-50 px-3 w-full h-[34px] ${
              comment ? `bg-stone-700` : `bg-stone-400`
            }`}
          >
            送信
          </button>
          {isPostingComment && <Spinner size={20} />}
        </div>
      </div>
    </div>
  );
};
