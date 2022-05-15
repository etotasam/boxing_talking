import React from "react";
import { RotatingLines } from "react-loader-spinner";
import { useQueryState } from "@/libs/hooks/useQueryState";

//! hooks
import { useDeleteComment } from "@/libs/hooks/useComment";
import { useAuth } from "@/libs/hooks/useAuth";

type Props = {
  isDeleting?: boolean;
  commentDelete: () => void;
};
export const CommentDeleteConfirmModal = ({ isDeleting = false, commentDelete }: Props) => {
  const { setter: setOpenDeleteConfirmModal } = useQueryState<boolean>("q/openDeleteConfirmModal");
  const message = isDeleting ? `削除中...` : `コメントを削除しますか？`;
  return (
    <div
      onClick={() => setOpenDeleteConfirmModal(false)}
      className={`z-50 w-[100vw] h-[100vh] fixed top-0 left-0 flex justify-center items-center t-bgcolor-opacity-1`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="bg-white w-1/3 px-10 py-5 rounded flex flex-col justify-center items-center drop-shadow-lg"
      >
        <p>{message}</p>
        {isDeleting ? (
          <div className="pt-3">
            <RotatingLines strokeColor="#151515" strokeWidth="3" animationDuration="1" width="30" />
          </div>
        ) : (
          <div className="flex mt-5">
            <button
              onClick={() => setOpenDeleteConfirmModal(false)}
              className="px-2 py-1 bg-stone-500 hover:bg-stone-700 duration-300 text-white rounded"
            >
              キャンセル
            </button>
            <button
              onClick={commentDelete}
              className="px-2 py-1 bg-green-500 hover:bg-green-700 duration-300 text-white rounded ml-10"
            >
              削除
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
