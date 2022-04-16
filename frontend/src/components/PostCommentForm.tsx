import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useCommentPost } from "@/libs/apis/commentPostAPI";
import { STATUS, MESSAGE } from "@/libs/utils";
import { useMessageController } from "@/libs/hooks/messageController";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { fetchThisMatchesComments, LoadingOFF, LoadingON } from "@/store/slice/commentsStateSlice";

//hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { usePostComment } from "@/libs/hooks/usePostComment";

const PostCommentForm = ({ matchId, getPostComRef }: { matchId: number; getPostComRef: (el: any) => void }) => {
  const dispatch = useDispatch();
  const { authState } = useAuth();
  const { postComment: customPostComment, commentPosting } = usePostComment();
  const { setMessageToModal } = useMessageController();
  const [comment, setComment] = React.useState<string>("");
  // const [posting, setPosting] = React.useState(IsCommentPosting.FALSE);

  const PostComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (commentPosting) return;
    try {
      // throw new Error("失敗しました");
      // const status = await useCommentPost(userId, matchId, comment);
      if (comment === "") {
        setMessageToModal(MESSAGE.COMMENT_POST_NULL, ModalBgColorType.ERROR);
        return;
      }
      await customPostComment(authState.user.id, matchId, comment);
      setComment("");
      await dispatch(fetchThisMatchesComments(matchId));
      setMessageToModal(MESSAGE.COMMENT_POST_SUCCESSFULLY, ModalBgColorType.SUCCESS);
    } catch (error: any) {
      // dispatch(LoadingOFF());
      setMessageToModal(MESSAGE.COMMENT_POST_FAILED, ModalBgColorType.ERROR);
    }
  };

  // elementRefを親に送る
  const comFormRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    getPostComRef(comFormRef);
  }, []);

  return (
    <div ref={comFormRef}>
      <form onSubmit={PostComment}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={"border border-gray-300 rounded py-2 px-3 resize-none w-[300px] h-[100px]"}
        />
        <button>送信</button>
      </form>
    </div>
  );
};

export default PostCommentForm;
