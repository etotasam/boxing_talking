import React from "react";
import Button from "@/components/Button";
import { useLocation } from "react-router-dom";
import { MESSAGE } from "@/libs/utils";

// slice
import { useGettingCommentsState } from "@/store/slice/commentsStateSlice";

// custom hooks
import { useCommentDelete } from "@/libs/hooks/commentDelete";

type CommentDeleteModalType = {
  userId: number;
  // deleteCommentId: number | undefined;
};

const CommentDeleteModal = ({
  userId,
}: // deleteCommentId,
CommentDeleteModalType) => {
  const {
    commentDeleteFunc,
    closeDeleteConfirmModale,
    isDeletingPending,
    deleteCommentId,
  } = useCommentDelete();
  const gettingCommentState = useGettingCommentsState();
  const parentClick = () => {
    closeDeleteConfirmModale();
  };
  const childClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // const deleteId = deleteCommentId
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));

  const commentDelete = async () => {
    if (!deleteCommentId) return;
    await commentDeleteFunc(userId, deleteCommentId, matchId);
  };

  React.useEffect(() => {
    document.body.style.overflowY = "hidden";
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
      <div
        onClick={(e) => childClick(e)}
        className="w-1/3 py-4 px-3 bg-white rounded"
      >
        <p className="py-5 text-center whitespace-pre-wrap">
          {isDeletingPending || gettingCommentState
            ? MESSAGE.COMMENT_DELETING
            : MESSAGE.COMMENT_DELETE_CONFIRM}
        </p>
        {!isDeletingPending && !gettingCommentState && (
          <div className="flex justify-center items-center">
            <Button
              onClick={commentDelete}
              className="bg-gray-500 hover:bg-gray-600"
            >
              削除
            </Button>
            <Button
              onClick={closeDeleteConfirmModale}
              className="ml-10 bg-gray-500 hover:bg-gray-600"
            >
              キャンセル
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentDeleteModal;
