import React, { useEffect } from "react";
import dayjs from "dayjs";
import { FaTrashAlt } from "react-icons/fa";
// import { useUser } from "@/store/slice/authUserSlice";
// import { useCommentDelete } from "@/libs/hooks/useCommentDelete";
import { motion, AnimatePresence } from "framer-motion";
//! components
import { Spinner } from "@/components/module/Spinner";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { PendingModal } from "@/components/modal/PendingModal";
//! custom hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useDeleteComment, CommentType } from "@/libs/hooks/useComment";
//! types
import { UserType } from "@/libs/hooks/useAuth";
import { useQueryState } from "@/libs/hooks/useQueryState";
//! toast message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE, STATUS } from "@/libs/utils";

type PropsType = {
  commentData: CommentType;
  className?: string;
};

const dateFormat = (date: Date) => {
  return dayjs(date).format("YYYY/MM/DD H:mm");
};

export const CommentComponent = ({ commentData, className }: PropsType) => {
  const { data: authUser } = useAuth();
  const { id: commentId, comment, user: postUser, created_at, vote } = commentData;
  // const { id: userId } = useUser();
  const classname = className || "";

  const { clearToastModaleMessage } = useToastModal();

  const {
    deleteComment,
    isLoading: isCommentDeleting,
    isSuccess: isCommentDeleted,
  } = useDeleteComment();

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

  const clickTrashBtn = (commentId: number) => {
    clearToastModaleMessage();
    setDeleteTargetId(commentId);
    setOpenDeleteConfirmModal(true);
  };

  const { state: isPostingComment } = useQueryState<boolean>("q/isPostingComment");

  const variant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

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
            // whileHover={{ scale: 1.3 }}
            data-testid={`trash-box`}
            onClick={() => clickTrashBtn(commentId)}
            className="absolute top-3 right-5 text-gray-600 hover:text-black hover:scale-125 duration-300"
          >
            <FaTrashAlt />
          </button>
        )}
        {isPostingComment && isNaN(commentData.id) && <Spinner />}
        {isCommentDeleting && commentData.id === deleteTargetId && <Spinner />}
      </div>
      <AnimatePresence>
        {openDeleteConfirmModal && deleteTargetId === commentData.id && (
          <ConfirmModal
            message={"コメントを削除しますか？"}
            okBtnString={"削除"}
            cancel={() => setOpenDeleteConfirmModal(false)}
            execution={commentDelete}
          />
        )}
      </AnimatePresence>
      {/* <CommentDeleteConfirmModal isDeleting={true} commentDelete={commentDelete} /> */}
    </>
  );
};
