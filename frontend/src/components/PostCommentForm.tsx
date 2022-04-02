import React from "react";
import { useDispatch } from "react-redux";
import { useCommentPost } from "@/libs/hooks/useCommentPost";
import { ModalBgColorType } from "@/components/MessageModal";
import { STATUS, MESSAGE } from "@/libs/utils";

import {
  fetchComments,
  LoadingOFF,
  LoadingON,
} from "@/store/slice/commentsStateSlice";

const PostCommentForm = ({
  userId,
  matchId,
  // commentsSetProp,
  messageModaleSetProp,
}: {
  userId: number;
  matchId: number;
  // commentsSetProp: (comments: CommentType[]) => void;
  messageModaleSetProp: (message: MESSAGE, bgColor: ModalBgColorType) => void;
}) => {
  // const [postComment, setPostComment] = React.useState("");
  enum IsCommentPosting {
    TRUE = "true",
    FALSE = "false",
  }
  const dispatch = useDispatch();
  const [comment, setComment] = React.useState<string>("");
  // const [posting, setPosting] = React.useState(IsCommentPosting.FALSE);
  const PostComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(LoadingON());
    try {
      // throw new Error("失敗しました");
      const status = await useCommentPost(userId, matchId, comment);
      if (status === STATUS.COMMENT_NULL) {
        dispatch(LoadingOFF());
        messageModaleSetProp(MESSAGE.COMMENT_POST_NULL, ModalBgColorType.ERROR);
        return;
      }
      await dispatch(fetchComments(matchId));
      messageModaleSetProp(
        MESSAGE.COMMENT_POST_SUCCESSFULLY,
        ModalBgColorType.SUCCESS
      );
      setComment("");
    } catch (error: any) {
      dispatch(LoadingOFF());
      messageModaleSetProp(MESSAGE.COMMENT_POST_FAILED, ModalBgColorType.ERROR);
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
