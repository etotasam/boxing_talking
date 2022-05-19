import React, { useEffect, useState } from "react";
//! component
import { CommentComponent } from "@/components/module/CommentComponent";
import { Spinner } from "@/components/module/Spinner";
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

  //? コメント欄をloadingにする条件
  const pending = isFetchingComments;

  return (
    <>
      <div
        className={`relative h-full min-h-[50px] overflow-y-auto box-border border-x border-gray-400 md:px-5`}
      >
        {commentsData &&
          (commentsData.length ? (
            commentsData.map((comment) => (
              <div
                key={comment.id}
                className="last:mb-7 first:mt-7 border-b last:border-0 border-gray-400"
              >
                <CommentComponent commentData={comment} />
              </div>
            ))
          ) : (
            <div>コメントはありません</div>
          ))}
      </div>
      {pending && <Spinner />}
    </>
  );
};
