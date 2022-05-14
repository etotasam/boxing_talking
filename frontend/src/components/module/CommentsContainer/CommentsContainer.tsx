import React, { useEffect, useState } from "react";
//! component
import { CommentComponent } from "@/components/module/CommentComponent";
import { SpinnerModal } from "@/components/modal/SpinnerModal";
import { useLocation } from "react-router-dom";
//!hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useFetchCommentsOnMatch } from "@/libs/hooks/useComment";

export const CommentsContainer = () => {
  const { data: authUser } = useAuth();

  //? urlからmatchIdを取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));

  //? この試合へのコメントを取得
  const {
    data: commentsData,
    isLoading: isFetchingComments,
    isFetching: isRefetchingComments,
  } = useFetchCommentsOnMatch(matchId);
  const [hasComment, setHasComment] = useState<boolean | undefined>(undefined);

  //? コメント欄をloadingにする条件
  const commentsPending = isFetchingComments;

  return (
    <>
      <div className={`relative h-full overflow-y-auto box-border border-x border-gray-400 px-5`}>
        {commentsData &&
          commentsData.map((comment) => (
            <CommentComponent
              key={comment.id}
              commentData={comment}
              className={`${comment.user.id === authUser?.id ? "" : ""}`}
            />
          ))}
        {hasComment === false && <div>コメントはありません</div>}
        {(commentsPending || isRefetchingComments) && <SpinnerModal />}
      </div>
    </>
  );
};
