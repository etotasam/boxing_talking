import React, { useEffect, useState } from "react";

// component
import { CommentComponent } from "@/components/module/CommentComponent";
import { SpinnerModal } from "@/components/modal/SpinnerModal";
import { useLocation } from "react-router-dom";

//hooks
import { useAuth } from "@/libs/hooks/useAuth";
// import { useFetchThisMatchComments } from "@/libs/hooks/useFetchThisMatchComments";
import { usePostComment } from "@/libs/hooks/usePostComment";
import { useCommentDelete } from "@/libs/hooks/useCommentDelete";
import { useCommentsOnMatch } from "@/libs/hooks/fetchers";

export const CommentsContainer = () => {
  const { data: authUser } = useAuth();

  //? urlからmatchIdを取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));

  //? この試合へのコメントを取得
  const { data: commentsData, mutate: commentsMutate } = useCommentsOnMatch(matchId);
  // const { commentsState, fetchThisMatchComments, clearComments, cancelFetchComments } = useFetchThisMatchComments();
  const [hasComment, setHasComment] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    if (!commentsData) return;
    if (commentsData.length) {
      setHasComment(true);
    } else {
      setHasComment(false);
    }
    return () => {
      commentsMutate(undefined);
    };
  }, [commentsData]);

  //? post comments state
  const { commentPosting } = usePostComment();

  // comment delete state
  const { deleteCommentsState } = useCommentDelete();

  //? コメント欄をloadingにする条件
  const commentsPending =
    commentsData === undefined || commentPosting || deleteCommentsState.pending;

  // useEffect(() => {
  //   if (!matchId || isNaN(matchId)) return;
  //   fetchThisMatchComments(matchId);
  //   return () => {
  //     clearComments();
  //     cancelFetchComments();
  //   };
  // }, [matchId]);

  return (
    <>
      <div
        className={`relative h-full overflow-y-auto box-border bg-white border border-gray-400 px-5 rounded-xl`}
      >
        {commentsData &&
          commentsData.map((props) => (
            <CommentComponent
              key={props.id}
              props={props}
              className={`${props.user.id === authUser!.id ? "bg-green-100" : ""}`}
            />
          ))}
        {hasComment === false && <div>コメントはありません</div>}
        {commentsPending && <SpinnerModal />}
      </div>
    </>
  );
};
