import React from "react";
import { CustomButton } from "@/components/atomic/Button";
import { useLocation } from "react-router-dom";
import { MESSAGE } from "@/libs/utils";

// import { useGettingCommentsState } from "@/store/slice/commentsStateSlice";

//! hooks
import { useCommentDelete } from "@/libs/hooks/useCommentDelete";
// import { useFetchThisMatchComments } from "@/libs/hooks/useFetchThisMatchComments";
import { useCommentsOnMatch } from "@/libs/hooks/fetchers";

type CommentDeleteModalType = {
  userId: number;
  // deleteCommentId: number | undefined;
};

export const CommentDeleteModal = ({
  userId,
}: // deleteCommentId,
CommentDeleteModalType) => {
  const { deleteComment, closeDeleteConfirmModale, deleteCommentsState } = useCommentDelete();
  // const { commentsState } = useFetchThisMatchComments();
  const parentClick = () => {
    closeDeleteConfirmModale();
  };
  const childClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));

  const { data: commentsData, mutate: commentsMutate } = useCommentsOnMatch(matchId);

  const commentDelete = async () => {
    if (!deleteCommentsState.idForDelete) return;
    await deleteComment({ userId, commentId: deleteCommentsState.idForDelete, matchId });
    commentsMutate();
  };

  React.useEffect(() => {
    document.body.style.overflowY = "hidden";
    document.body.style.width = "99vw";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);
  return (
    <div
      data-testid={"delete-modal"}
      onClick={parentClick}
      className="fixed top-0 left-0 w-[100vw] h-[100vh] t-bgcolor-opacity-30 flex justify-center items-center t-bgcolor-opacity-5"
    >
      <div onClick={(e) => childClick(e)} className="w-1/3 py-4 px-3 bg-white rounded">
        <p className="py-5 text-center whitespace-pre-wrap">
          {deleteCommentsState.pending || commentsData === undefined
            ? MESSAGE.COMMENT_DELETING
            : MESSAGE.COMMENT_DELETE_CONFIRM}
        </p>
        {!deleteCommentsState.pending && commentsData && (
          <div className="flex justify-center items-center">
            <CustomButton onClick={commentDelete} className="bg-gray-500 hover:bg-gray-600">
              削除
            </CustomButton>
            <CustomButton
              onClick={closeDeleteConfirmModale}
              className="ml-10 bg-gray-500 hover:bg-gray-600"
            >
              キャンセル
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
};
