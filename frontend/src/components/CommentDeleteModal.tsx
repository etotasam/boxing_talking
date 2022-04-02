import React from "react";
import axios, { isAxiosError } from "@/libs/axios";
import Button from "@/components/Button";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComments,
  LoadingON,
  selectGettingCommentsState,
} from "@/store/slice/commentsStateSlice";
import { ModalBgColorType } from "@/components/MessageModal";
import { MESSAGE } from "@/libs/utils";

type CommentDeleteModalType = {
  deleteConfirmModalInvisible: () => void;
  userId: number;
  deleteCommentId: number | undefined;
  operateMessageModale: (message: MESSAGE, bgColor: ModalBgColorType) => void;
};

const CommentDeleteModal = ({
  deleteConfirmModalInvisible,
  userId,
  deleteCommentId,
  operateMessageModale,
}: CommentDeleteModalType) => {
  const dispatch = useDispatch();
  const parentClick = () => {
    deleteConfirmModalInvisible();
  };
  const childClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));

  const deleting = useSelector(selectGettingCommentsState);

  const commentDelete = async () => {
    dispatch(LoadingON());
    try {
      await axios.delete("api/delete_comment", {
        data: {
          userId,
          commentId: deleteCommentId,
        },
      });
      await dispatch(fetchComments(matchId));
      deleteConfirmModalInvisible();
      operateMessageModale(MESSAGE.COMMENT_DELETED, ModalBgColorType.DELETE);
    } catch (error) {
      if (isAxiosError(error)) {
        operateMessageModale(
          MESSAGE.COMMENT_DELETE_FAILED,
          ModalBgColorType.ERROR
        );
      }
    }
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
      className="fixed top-0 left-0 w-[100vw] h-[100vh] t-bgcolor-opacity-30 flex justify-center items-center"
    >
      <div
        onClick={(e) => childClick(e)}
        className="w-1/3 py-4 px-3 bg-white rounded"
      >
        <p className="py-5 text-center whitespace-pre-wrap">
          {deleting ? MESSAGE.COMMENT_DELETING : MESSAGE.COMMENT_DELETE_CONFIRM}
        </p>
        {!deleting && (
          <div className="flex justify-center items-center">
            <Button
              onClick={commentDelete}
              className="bg-gray-500 hover:bg-gray-600"
            >
              削除
            </Button>
            <Button
              onClick={deleteConfirmModalInvisible}
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
