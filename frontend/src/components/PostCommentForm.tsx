import React from "react";
import axios from "@/libs/axios";
import { useDispatch } from "react-redux";
import { setSuccessMessage } from "@/store/slice/messageByPostCommentSlice";
import getThisMatchCommentsAPI, {
  CommentType,
} from "@/libs/apis/getThisMatchCommentsAPI";

const PostCommentForm = ({
  userId,
  matchId,
  commentsSet,
}: {
  userId: number;
  matchId: number;
  commentsSet: (comments: CommentType[]) => void;
}) => {
  // const [postComment, setPostComment] = React.useState("");
  enum PostLoding {
    LOADING = "loading",
    LOADED = "loaded",
  }
  const dispatch = useDispatch();
  const [comment, setComment] = React.useState<string>();
  const [posting, setPosting] = React.useState<PostLoding>(PostLoding.LOADED);
  const PostComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPosting(PostLoding.LOADING);
    const { data }: { data: { message: string } } = await axios.post(
      "api/post_comment",
      {
        userId,
        matchId,
        comment,
      }
    );
    const message = data.message;
    const comments: CommentType[] = await getThisMatchCommentsAPI(matchId);
    dispatch(setSuccessMessage(message));
    setTimeout(() => {
      dispatch(setSuccessMessage(""));
    }, 5000);
    commentsSet(comments);
    setComment("");
    setPosting(PostLoding.LOADED);
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
        {posting === PostLoding.LOADED && <button>送信</button>}
      </form>
    </div>
  );
};

export default PostCommentForm;
