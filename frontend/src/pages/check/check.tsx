import React, { useEffect, useState } from "react";
import reducer, {
  selectComments,
  fetchComments,
  selectGettingCommentsState,
} from "@/store/slice/commentsStateSlice";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "@/store/slice/authUserSlice";

export const Check = () => {
  const dispatch = useDispatch();
  const commentsOnMatch = useSelector(selectComments);
  const commentsGetLoading = useSelector(selectGettingCommentsState);
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchComments(1));
  }, []);

  if (commentsGetLoading) return <div>loading...</div>;
  return (
    <div>
      <h1>チェック</h1>
      {user && <h2>{user.name}さん</h2>}
      {commentsOnMatch &&
        commentsOnMatch.length &&
        commentsOnMatch.map((el) => (
          <div key={el.id} className={"bg-red-100 m-2"}>
            <p>{el.comment}</p>
          </div>
        ))}
    </div>
  );
};
