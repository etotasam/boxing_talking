import React from "react";
import dayjs from "dayjs";
import { FaTrashAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/slice/authUserSlice";

type CommentPropsType = {
  commentId: number;
  comment: string;
  userName: string;
  createdAt: Date;
  className: string;
  commentUserId: number;
  deleteConfirmModalVisible: (commentId: number) => void;
};
const dateFormat = (date: Date) => {
  return dayjs(date).format("YYYY/MM/DD H:mm");
};

export const CommentComponent = React.memo(
  ({
    commentId,
    comment,
    userName,
    createdAt,
    className,
    commentUserId,
    deleteConfirmModalVisible,
  }: CommentPropsType) => {
    const { id: userId } = useSelector(selectUser);

    return (
      <div className={`relative rounded py-2 px-3 mt-3 ${className}`}>
        <div className="whitespace-pre-wrap">{comment}</div>
        <div className="flex mt-2">
          <time className="text-gray-600 text-sm">{dateFormat(createdAt)}</time>
          <p className="text-gray-700 text-sm ml-5">{userName}</p>
        </div>
        {commentUserId === userId && (
          <button
            data-testid={`trash-box`}
            onClick={() => deleteConfirmModalVisible(commentId)}
            className="absolute top-3 right-3 text-gray-600 hover:text-black"
          >
            <FaTrashAlt />
          </button>
        )}
      </div>
    );
  }
);
