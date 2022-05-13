import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { queryKeys } from "@/libs/queryKeys"
import { Axios, isAxiosError } from "../axios"
import { useLocation, useNavigate } from "react-router-dom";

//! message contoller
import { useMessageController } from "@/libs/hooks/messageController";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";

//! types
import { UserType } from "@/libs/hooks/useAuth"


//! 試合のコメントの取得

export type CommentType = {
  id: number;
  user: UserType;
  comment: string;
  created_at: Date;
};

export const useFetchCommentsOnMatch = (matchId: number) => {
  const api = useCallback(async () => {
    return await Axios.get(queryKeys.comments, {
      params: {
        match_id: matchId,
      },
    }).then(v => v.data)
  }, [])

  const { data, isLoading, isFetching } = useQuery<CommentType[]>([queryKeys.comments, { id: matchId }], api)

  return { data, isLoading, isFetching }
}



//! コメント投稿

export const usePostComment = () => {
  type ApiPropsType = {
    userId: number,
    matchId: number,
    comment: string
  }
  const queryClient = useQueryClient()
  const { setMessageToModal } = useMessageController()
  const api = useCallback(async ({ userId, matchId, comment }: ApiPropsType) => {
    await Axios.post(queryKeys.comments, {
      user_id: userId,
      match_id: matchId,
      comment: comment
    })
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
  })
  const postComment = ({ userId, matchId, comment }: ApiPropsType) => {
    mutate({ userId, matchId, comment }, {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.comments, { id: matchId }])
        setMessageToModal(MESSAGE.COMMENT_POST_SUCCESSFULLY, ModalBgColorType.SUCCESS)
      },
      onError: () => {
        setMessageToModal(MESSAGE.COMMENT_POST_FAILED, ModalBgColorType.ERROR)
      }
    })
  }
  return { postComment, isLoading, isSuccess }
}


//! コメントの削除


export const useDeleteComment = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  let matchIdOnParam = Number(query.get("id"));

  type ApiPropsType = { userId: number, commentId: number }
  const { setMessageToModal } = useMessageController()
  const queryClient = useQueryClient()

  const api = useCallback(async ({ userId, commentId }: ApiPropsType) => {
    await Axios.delete(queryKeys.comments, {
      data: {
        user_id: userId,
        comment_id: commentId
      },
    })
  }, [])

  const { mutate, isLoading } = useMutation(api)
  const deleteComment = ({ userId, commentId }: ApiPropsType & { matchId?: number }) => {
    mutate({ userId, commentId }, {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.comments, { id: matchIdOnParam }])
        setMessageToModal(MESSAGE.COMMENT_DELETED, ModalBgColorType.DELETE)
      },
      onError: () => {
        setMessageToModal(MESSAGE.COMMENT_DELETE_FAILED, ModalBgColorType.ERROR)
      }
    })
  }

  return { deleteComment, isLoading }
}