import React from "react";
import dayjs from "dayjs";
import { FaTrashAlt } from "react-icons/fa";
// import { useUser } from "@/store/slice/authUserSlice";
import { useAuth } from "@/libs/hooks/useAuth";
import { useCommentDelete } from "@/libs/hooks/useCommentDelete";

import { UserType } from "@/libs/apis/authAPI";

type PropsType = {
  props: {
    id: number;
    comment: string;
    user: UserType;
    created_at: Date;
  };
  className: string;
};

type CommentPropsType = {
  commentId: number;
  comment: string;
  userName: string;
  createdAt: Date;
  className: string;
  userId: number;
  // deleteConfirmModalVisible: (commentId: number) => void;
};
const dateFormat = (date: Date) => {
  return dayjs(date).format("YYYY/MM/DD H:mm");
};

export const CommentComponent = React.memo(({ props, className }: PropsType) => {
  const {
    authState: { user: authUser },
  } = useAuth();
  const { id: commentId, comment, user: postUser, created_at } = props;
  // const { user: authUser } = authState;
  // const { id: userId } = useUser();
  const classname = className || "";
  const { openDeleteConfirmModale, defineDeleteCommentId } = useCommentDelete();

  const commentDelete = () => {
    defineDeleteCommentId(commentId);
    openDeleteConfirmModale();
  };

  return (
    <>
      {/* <Border className="first:border-0 first:mt-7" /> */}
      {/* <div className="w-full first:h-[0px] h-[1px] bg-red-400" /> */}
      <hr className="border-gray-400 first:border-0 first:mt-7" />
      <div className={`relative py-3 m-3 last:mb-7 ${classname}`}>
        <div className="whitespace-pre-wrap">{comment}</div>
        <div className="flex mt-2">
          <time className="text-gray-600 text-sm">{dateFormat(created_at)}</time>
          <p className="text-gray-700 text-sm ml-5">{postUser.name}</p>
        </div>
        {postUser.id === authUser.id && (
          <button
            data-testid={`trash-box`}
            onClick={commentDelete}
            className="absolute top-3 right-3 text-gray-600 hover:text-black"
          >
            <FaTrashAlt />
          </button>
        )}
      </div>
    </>
  );
});
