import React, { useEffect } from "react";
import dayjs from "dayjs";
import { FaTrashAlt } from "react-icons/fa";
// import { useUser } from "@/store/slice/authUserSlice";
// import { useCommentDelete } from "@/libs/hooks/useCommentDelete";

//! components
import { Spinner } from "@/components/module/Spinner";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { PendingModal } from "@/components/modal/PendingModal";
//! custom hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useDeleteComment, useFetchCommentsOnMatch, CommentType } from "@/libs/hooks/useComment";
//! types
import { UserType } from "@/libs/hooks/useAuth";
import { useQueryState } from "@/libs/hooks/useQueryState";

type PropsType = {
  commentData: CommentType;
  className?: string;
};

// type CommentPropsType = {
//   commentId: number;
//   comment: string;
//   userName: string;
//   createdAt: Date;
//   className: string;
//   userId: number;
// };
const dateFormat = (date: Date) => {
  return dayjs(date).format("YYYY/MM/DD H:mm");
};

export const CommentComponent = ({ commentData, className }: PropsType) => {
  const { data: authUser } = useAuth();
  const { id: commentId, comment, user: postUser, created_at, vote } = commentData;
  // const { id: userId } = useUser();
  const classname = className || "";
  // const { openDeleteConfirmModale, defineDeleteCommentId } = useCommentDelete();
  const {
    deleteComment,
    isLoading: isCommentDeleting,
    isSuccess: isCommentDeleted,
  } = useDeleteComment();
  //? modalを挟んでdeleteCommentを実行するからなのか isLoading が反映されないが、useQueryで共有すれば反映される。なぜかは謎
  const { state: isCommentDeletePending, setter: setIsCommentDeleting } =
    useQueryState("q/isCommentDeleting");
  useEffect(() => {
    setIsCommentDeleting(isCommentDeleting);
  }, [isCommentDeleting]);

  //? delete対象コメントのidを共有
  const { state: deleteTargetId, setter: setDeleteTargetId } = useQueryState<number | undefined>(
    "q/deleteTargetCommentId"
  );

  //? コメントの削除
  const commentDelete = () => {
    if (!authUser || !deleteTargetId) return;
    setOpenDeleteConfirmModal(false);
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

  const onClickButton = (commentId: number) => {
    setDeleteTargetId(commentId);
    setOpenDeleteConfirmModal(true);
  };

  const { state: isPostingComment } = useQueryState<boolean>("q/isPostingComment");

  return (
    <>
      <div className={`relative py-3 md:px-3 pl-5 ${classname}`}>
        <div className="mr-10">
          <div className="whitespace-pre-wrap text-stone-600">{comment}</div>
          <div className="flex mt-2">
            <time className="text-gray-600 text-sm">{dateFormat(created_at)}</time>
            <div className="flex">
              <p className="text-gray-700 text-sm ml-5">
                {postUser ? postUser.name : process.env.REACT_APP_GUEST_NAME}
              </p>
              <div className="flex justify-center items-center ml-2">
                <span
                  className={`block w-[7px] h-[7px] rounded-lg ${
                    vote === "red" ? `bg-red-600` : vote === "blue" && `bg-blue-600`
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {postUser && postUser.id === authUser?.id && (
          <button
            data-testid={`trash-box`}
            onClick={() => onClickButton(commentId)}
            className="absolute top-3 right-5 text-gray-600 hover:text-black"
          >
            <FaTrashAlt />
          </button>
        )}
        {isPostingComment && isNaN(commentData.id) && <Spinner />}
        {isCommentDeletePending && commentData.id === deleteTargetId && <Spinner />}
      </div>
      {openDeleteConfirmModal && deleteTargetId === commentData.id && (
        <ConfirmModal
          message={"コメントを削除しますか？"}
          okBtnString={"削除"}
          cancel={() => setOpenDeleteConfirmModal(false)}
          execution={commentDelete}
        />
      )}
      {/* <CommentDeleteConfirmModal isDeleting={true} commentDelete={commentDelete} /> */}
    </>
  );
};
