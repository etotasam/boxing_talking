import React, { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { queryKeys } from "@/libs/queryKeys"
import { Axios } from "../axios"
import { useLocation } from "react-router-dom";

//! hooks
import { useAuth } from "@/libs/hooks/useAuth"

//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";

//! types
import { UserType } from "@/libs/hooks/useAuth"
import dayjs from "dayjs";
import { useQueryState } from "./useQueryState";


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
  const { data: user } = useAuth()
  const { setToastModalMessage } = useToastModal()
  const api = useCallback(async ({ userId, matchId, comment }: ApiPropsType) => {
    await Axios.post(queryKeys.comments, {
      user_id: userId,
      match_id: matchId,
      comment: comment
    })
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: ({ matchId, comment }) => {
      const nowDate = dayjs().format('YYYY/MM/DD')
      const snapshot = queryClient.getQueryData<CommentType[]>([queryKeys.comments, { id: matchId }])
      queryClient.setQueryData([queryKeys.comments, { id: matchId }], [{ id: NaN, user, comment, created_at: nowDate }, ...snapshot!])
      return { snapshot }
    }
  })
  const postComment = ({ userId, matchId, comment }: ApiPropsType) => {
    const trimmedComment = comment.trim()
    mutate({ userId, matchId, comment: trimmedComment }, {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.comments, { id: matchId }])
        setToastModalMessage({ message: MESSAGE.COMMENT_POST_SUCCESSFULLY, bgColor: ModalBgColorType.SUCCESS })
      },
      onError: (error, variables, context) => {
        queryClient.setQueryData([queryKeys.comments, { id: matchId }], context?.snapshot)
        setToastModalMessage({ message: MESSAGE.COMMENT_POST_FAILED, bgColor: ModalBgColorType.ERROR })
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
  // const { setMessageToModal } = useMessageController()
  const { setToastModalMessage } = useToastModal()
  const queryClient = useQueryClient()

  const api = useCallback(async ({ userId, commentId }: ApiPropsType) => {
    await Axios.delete(queryKeys.comments, {
      data: {
        user_id: userId,
        comment_id: commentId
      },
    })
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api)
  const deleteComment = ({ userId, commentId }: ApiPropsType & { matchId?: number }) => {
    mutate({ userId, commentId }, {
      onSuccess: (data, { commentId }) => {
        console.log("test");
        const snapshot = queryClient.getQueryData<CommentType[]>([queryKeys.comments, { id: matchIdOnParam }])
        const commentsWidthoutDeleteComment = snapshot!.filter(commentState => commentState.id !== commentId)
        queryClient.setQueryData([queryKeys.comments, { id: matchIdOnParam }], commentsWidthoutDeleteComment)
        queryClient.invalidateQueries([queryKeys.comments, { id: matchIdOnParam }])
        setToastModalMessage({ message: MESSAGE.COMMENT_DELETED, bgColor: ModalBgColorType.DELETE })
      },
      onError: () => {
        setToastModalMessage({ message: MESSAGE.COMMENT_DELETE_FAILED, bgColor: ModalBgColorType.ERROR })
      }
    })
  }

  return { deleteComment, isLoading, isSuccess }
}