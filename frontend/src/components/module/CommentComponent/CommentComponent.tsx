import React, { useEffect } from "react";
import dayjs from "dayjs";
import { FaTrashAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
//! components
import { Spinner } from "@/components/module/Spinner";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
//! custom hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useDeleteComment, CommentType } from "@/libs/hooks/useComment";
//! types
import { useQueryState } from "@/libs/hooks/useQueryState";
//! toast message contoller
import { useToastModal } from "@/libs/hooks/useToastModal";

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

  return (
    <>
      <motion.div
        layout
        initial={false}
        className={`relative py-3 md:px-5 pl-5 rounded-xl drop-shadow ${
          vote === "red" ? `bg-red-100` : vote === "blue" ? `bg-blue-100` : `bg-stone-100`
        } ${classname}`}
      >
        <div className="mr-10">
          <div className="whitespace-pre-wrap text-stone-600">{comment}</div>
          <div className="flex mt-2">
            <div className="flex">
              {/* 予想color */}
              <div className="flex justify-center items-center">
                <span
                  className={`block w-[7px] h-[7px] rounded-lg ${
                    vote === "red" ? `bg-red-600` : vote === "blue" && `bg-blue-600`
                  }`}
                />
              </div>
              {/* 名前 */}
              <p className="text-gray-500 text-sm ml-2">
                {postUser ? postUser.name : process.env.REACT_APP_GUEST_NAME}
              </p>
              {/* 投稿時間 */}
              <time className="text-gray-400 text-sm ml-2">{dateFormat(created_at)}</time>
            </div>
          </div>
        </div>

        {postUser && !isNaN(commentId) && postUser.id === authUser?.id && (
          <motion.button
            whileHover={{ scale: 1.3, color: "black" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { duration: 0.2 } }}
            data-testid={`trash-box`}
            onClick={() => clickTrashBtn(commentId)}
            className="absolute top-3 right-5 text-gray-600"
          >
            <FaTrashAlt />
          </motion.button>
        )}
        {isPostingComment && isNaN(commentData.id) && (
          <Spinner className="rounded-xl bg-black/20" />
        )}
        {isCommentDeleting && commentData.id === deleteTargetId && (
          <Spinner className="rounded-xl bg-black/20" />
        )}
      </motion.div>
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
