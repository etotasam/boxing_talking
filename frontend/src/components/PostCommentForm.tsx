import React from "react";
import { useDispatch } from "react-redux";
import { useCommentPost } from "@/libs/apis/commentPostAPI";
import { STATUS, MESSAGE } from "@/libs/utils";
import { useMessageController } from "@/libs/hooks/messageController";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { usePostComment } from "@/libs/hooks/postComment";
import {
  fetchThisMatchesComments,
  LoadingOFF,
  LoadingON,
} from "@/store/slice/commentsStateSlice";

const PostCommentForm = ({
  userId,
  matchId,
  isPostCommentPending,
}: {
  userId: number;
  matchId: number;
  isPostCommentPending: (bool: boolean) => void;
}) => {
  const dispatch = useDispatch();
  const { postComment: customPostComment, commentPostPending } =
    usePostComment();
  const { setMessageToModal } = useMessageController();
  const [comment, setComment] = React.useState<string>("");
  // const [posting, setPosting] = React.useState(IsCommentPosting.FALSE);
  const PostComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (commentPostPending) return;
    try {
      // throw new Error("失敗しました");
      // const status = await useCommentPost(userId, matchId, comment);
      if (comment === "") {
        setMessageToModal(MESSAGE.COMMENT_POST_NULL, ModalBgColorType.ERROR);
        return;
      }
      isPostCommentPending(true);
      await customPostComment(userId, matchId, comment);
      setComment("");
      await dispatch(fetchThisMatchesComments(matchId));
      isPostCommentPending(false);
      setMessageToModal(
        MESSAGE.COMMENT_POST_SUCCESSFULLY,
        ModalBgColorType.SUCCESS
      );
    } catch (error: any) {
      // dispatch(LoadingOFF());
      setMessageToModal(MESSAGE.COMMENT_POST_FAILED, ModalBgColorType.ERROR);
    }
  };
  return (
    <div>
      <form onSubmit={PostComment}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={
            "border border-gray-300 rounded py-2 px-3 resize-none w-[300px] h-[100px]"
          }
        />
        <button>送信</button>
      </form>
    </div>
  );
};

export default PostCommentForm;
