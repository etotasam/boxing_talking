import React, { useEffect } from "react";

// component
import { CommentComponent } from "@/components/module/CommentComponent";
import { SpinnerModal } from "@/components/modal/SpinnerModal";
import { useLocation } from "react-router-dom";

//hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useFetchThisMatchComments } from "@/libs/hooks/useFetchThisMatchComments";
import { usePostComment } from "@/libs/hooks/usePostComment";
import { useCommentDelete } from "@/libs/hooks/useCommentDelete";

export const CommentsContainer = () => {
  const { authState } = useAuth();
  const { commentsState, fetchThisMatchComments, clearComments, cancelFetchComments } = useFetchThisMatchComments();

  // post comments state
  const { commentPosting } = usePostComment();

  // comment delete state
  const { deleteCommentsState } = useCommentDelete();

  // urlからmatchIdを取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));

  useEffect(() => {
    if (!matchId || isNaN(matchId)) return;
    fetchThisMatchComments(matchId);
    return () => {
      clearComments();
      cancelFetchComments();
    };
  }, [matchId]);

  return (
    <>
      <div className={`relative h-full overflow-y-auto box-border border border-gray-400 px-5 rounded-xl`}>
        {commentsState.comments &&
          commentsState.comments.map((props) => (
            <CommentComponent
              key={props.id}
              props={props}
              // commentId={commentId}
              // userId={postUser.id}
              // comment={comment}
              // userName={postUser.name}
              // createdAt={created_at}
              className={`${props.user.id === authState.user.id ? "bg-green-100" : ""}`}
            />
          ))}
        {commentsState.hasNotComments && <div>コメントはありません</div>}
        {(commentsState.pending || commentPosting || deleteCommentsState.pending) && <SpinnerModal />}
      </div>
    </>
  );
};
