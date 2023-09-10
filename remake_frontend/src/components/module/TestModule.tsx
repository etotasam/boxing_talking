import React, { useEffect, useState } from "react";

type CommentType = {
  id: number;
  post_user_name: string;
  // match_id: number,
  comment: string;
  vote: string | undefined;
  created_at: string;
};

const comments = [
  {
    id: 0,
    post_user_name: "test1",
    comment: "てすとコメント",
    vote: undefined,
    created_at: "2023-9-10",
  },
  {
    id: 1,
    post_user_name: "test2",
    comment: "てすとコメント2",
    vote: undefined,
    created_at: "2023-9-10",
  },
  {
    id: 2,
    post_user_name: "test2",
    comment: "てすとコメント3",
    vote: undefined,
    created_at: "2023-9-10",
  },
];

export const TestModule = () => {
  const word = "?name=inoue&country=Japan&page=2";

  console.log(word.slice(1).split("&"));

  return (
    <>
      {comments && comments.length >= 1 && (
        <section>
          {comments.map((commentData) => (
            <div
              key={commentData.id}
              className={"p-5 border-b-[1px] border-stone-200"}
            >
              <p
                className="text-[18px] text-stone-600"
                dangerouslySetInnerHTML={{
                  __html: commentData.comment,
                }}
              />
              <div className="flex mt-3">
                <time className="text-sm leading-[24px] text-stone-400">
                  {commentData.created_at}
                </time>
                <p className="text-ms ml-3 text-stone-600">
                  {commentData.post_user_name}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}
    </>
  );
};
