import React, { useEffect } from "react";
import dayjs from "dayjs";
import { FaTrashAlt } from "react-icons/fa";
// import { useUser } from "@/store/slice/authUserSlice";
// import { useCommentDelete } from "@/libs/hooks/useCommentDelete";

//! components
import { CommentDeleteConfirmModal } from "@/components/modal/CommentDeleteConfirmModal";
import { PendingModal } from "@/components/modal/PendingModal";
//! custom hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useDeleteComment } from "@/libs/hooks/useComment";
//! types
import { UserType } from "@/libs/hooks/useAuth";
import { useQueryState } from "@/libs/hooks/useQueryState";

type PropsType = {
  commentData: {
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

export const CommentComponent = React.memo(({ commentData, className }: PropsType) => {
  const { data: authUser } = useAuth();
  const { id: commentId, comment, user: postUser, created_at } = commentData;
  // const { user: authUser } = authState;
  // const { id: userId } = useUser();
  const classname = className || "";
  // const { openDeleteConfirmModale, defineDeleteCommentId } = useCommentDelete();
  const {
    deleteComment,
    isLoading: isCommentDeleting,
    isSuccess: isCommentDeleted,
  } = useDeleteComment();

  //? コメントの削除
  const commentDelete = () => {
    if (!authUser || !deleteTargetId) return;
    deleteComment({ userId: authUser.id, commentId: deleteTargetId });
  };

  //? コメントの削除が成功したらモーダルを閉じて、対象IDをundefinedにする
  useEffect(() => {
    if (!isCommentDeleted) return;
    setOpenDeleteConfirmModal(false);
    setDeleteTargetId(undefined);
  }, [isCommentDeleted]);

  const { state: openDeleteConfirmModal, setter: setOpenDeleteConfirmModal } =
    useQueryState<boolean>("q/openDeleteConfirmModal", false);

  const { state: deleteTargetId, setter: setDeleteTargetId } = useQueryState<number | undefined>(
    "q/deleteTargetCommentId"
  );

  const onClickButton = (commentId: number) => {
    setDeleteTargetId(commentId);
    setOpenDeleteConfirmModal(true);
  };

  return (
    <>
      <div className={`relative py-3 px-3 ${classname}`}>
        <div className="mr-10">
          <div className="whitespace-pre-wrap text-stone-600">{comment}</div>
          <div className="flex mt-2">
            <time className="text-gray-600 text-sm">{dateFormat(created_at)}</time>
            <p className="text-gray-700 text-sm ml-5">{postUser.name}</p>
          </div>
        </div>

        {postUser.id === authUser?.id && (
          <button
            data-testid={`trash-box`}
            onClick={() => onClickButton(commentId)}
            className="absolute top-3 right-3 text-gray-600 hover:text-black"
          >
            <FaTrashAlt />
          </button>
        )}
      </div>
      {openDeleteConfirmModal && (
        <CommentDeleteConfirmModal isDeleting={isCommentDeleting} commentDelete={commentDelete} />
      )}
      {/* <CommentDeleteConfirmModal isDeleting={true} commentDelete={commentDelete} /> */}
    </>
  );
});
