import React, { useEffect } from "react";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";
//! components
import { SpinnerModal } from "@/components/modal/SpinnerModal";
//! hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { usePostComment } from "@/libs/hooks/useComment";

export const PostCommentForm = ({
  matchId,
  getPostComRef,
}: {
  matchId: number;
  getPostComRef: (el: any) => void;
}) => {
  const { data: authUser } = useAuth();
  // const { postComment: customPostComment, commentPosting } = usePostComment();
  const {
    postComment,
    isLoading: isPostingComment,
    isSuccess: isSuccessPostComment,
  } = usePostComment();
  const { setToastModalMessage } = useToastModal();
  const [comment, setComment] = React.useState<string>("");
  // const [posting, setPosting] = React.useState(IsCommentPosting.FALSE);
  // const { data, error, mutate: commentsMutate } = useCommentsOnMatch(matchId);

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

  //? elementRefを親に送る(heightを調べる為)
  const comFormRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    getPostComRef(comFormRef);
  }, []);

  //? 投稿コメントをセットする
  const commentEl = React.useRef(comment);
  const commentInput = (e: React.FormEvent<HTMLDivElement>) => {
    const commentDiv = e.target as HTMLDivElement;
    setComment(commentDiv.innerText);
  };

  const [isFocus, setIsFocus] = React.useState(false);

  return (
    <div ref={comFormRef} className="w-full pb-5">
      <div className={`w-full flex items-end px-10`}>
        <div
          ref={divRef}
          className={`w-full px-2 py-1 border-b outline-none text-stone-600 border-stone-600 ${
            (isFocus || comment) && `bg-white`
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
            className="border rounded bg-stone-400 hover:bg-green-500 focus:bg-green-500 duration-300 text-stone-50 px-3 py-1 w-full h-[35px]"
          >
            送信
          </button>
          {isPostingComment && <SpinnerModal />}
        </div>
      </div>
    </div>
  );
};
