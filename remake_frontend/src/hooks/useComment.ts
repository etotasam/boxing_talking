import React, { useCallback } from "react"
import { useLocation } from "react-router-dom"
import { Axios } from "@/assets/axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { QUERY_KEY } from "@/assets/queryKeys"
//! hook
import { useAuth } from "@/hooks/useAuth"
import { useLoading } from "@/hooks/useLoading"
import { useToastModal } from "@/hooks/useToastModal"
//! types
import { UserType } from "@/assets/types"
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from "@/assets/statusesOnToastModal"


type CommentType = {
  id: number;
  post_user_name: string;
  // match_id: number,
  comment: string;
  vote: string | undefined;
  created_at: string;
}



//! コメント取得
export const useFetchComments = (matchId: number) => {
  const api = async () => {
    try {
      return await Axios.get("/api/comment", {
        params: {
          match_id: matchId,
        },
      }).then(v => v.data)
    } catch (error) {
      console.error("Error when fetch comment...", error);
    }
  }

  const { data, isLoading, isFetching, refetch } = useQuery<CommentType[]>([QUERY_KEY.comment, { id: matchId }], api)

  return { data, isLoading, isFetching, refetch }
}


//! コメント投稿

export const usePostComment = () => {
  type ApiPropsType = {
    matchId: number,
    comment: string
  }
  // const { setter: setIsCommentPosting } = useQueryState("q/isCommentPosting", false)
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchIdOnParam = Number(query.get("id"));
  const queryClient = useQueryClient()
  const { data: user } = useAuth()
  const { setToastModal } = useToastModal()
  const api = useCallback(async ({ matchId, comment }: ApiPropsType) => {
    await Axios.post("/api/comment", {
      // user_id: userId,
      match_id: matchId,
      comment: comment
    })
  }, [])

  const { mutate, isLoading, isSuccess, isError } = useMutation(api, {
    onMutate: () => {
      // setIsCommentPosting(true)
      // const nowDate = dayjs().format('YYYY/MM/DD H:mm')
      // //? 疑似id (backendでdatabaseにコメントが登録されるまでの間、frontendで使用するid)
      // // ! 疑似idを使うとフロント側でちょっとした不具合発生。コメントのゴミ箱アイコンはcommentIdがNaNの時は表示されない様にしている。
      // const temporaryId = Number(`${Math.floor(Math.random() * 1000) + dayjs().format(`HHmmSSS`)}`)
      // //? userのこの試合のvote
      // const vote = queryClient.getQueryData<VoteType[]>(queryKeys.vote)?.find(v => v.match_id === matchId)
      // const snapshot = queryClient.getQueryData<CommentType[]>([queryKeys.comments, { id: matchId }])
      // queryClient.setQueryData([queryKeys.comments, { id: matchId }], [{ id: NaN, user, comment, vote: vote?.vote_for, created_at: nowDate }, ...snapshot!])
      // return { snapshot }
    }
  })
  const postComment = ({ matchId, comment }: ApiPropsType) => {
    const trimmedComment = comment.trim()
    mutate({ matchId, comment: trimmedComment }, {
      onSuccess: () => {
        // ? match_idを指定してコメントを再取得
        queryClient.invalidateQueries([QUERY_KEY.comment, { id: matchId }]);
        // setIsCommentPosting(false)
        // queryClient.invalidateQueries([queryKeys.comments, { id: matchId }])
        // setToastModalMessage({ message: MESSAGE.COMMENT_POST_SUCCESSFULLY, bgColor: ModalBgColorType.SUCCESS })
      },
      onError: (error, variables, context) => {
        // setIsCommentPosting(false)
        // queryClient.setQueryData([queryKeys.comments, { id: matchId }], context?.snapshot)
        // setToastModalMessage({ message: MESSAGE.COMMENT_POST_FAILED, bgColor: ModalBgColorType.ERROR })
      }
    })
  }
  return { postComment, isLoading, isSuccess, isError }
}


//! コメントの削除

export const useDeleteComment = () => {
  // const { setter: setIsCommentDeleting } = useQueryState("q/isCommentDeleting", false)
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchIdOnParam = Number(query.get("id"));

  type ApiPropsType = { commentID: number, matchID: number }
  const { setToastModal, showToastModal } = useToastModal()
  const { startLoading, resetLoadingState } = useLoading()
  const queryClient = useQueryClient()

  const api = useCallback(async ({ commentID, matchID }: ApiPropsType) => {

    await Axios.delete('/api/comment', {
      data: {
        comment_id: commentID
      },
    })

  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
      // setIsCommentDeleting(true)
    }
  })
  const deleteComment = ({ commentID, matchID }: ApiPropsType) => {
    mutate({ commentID, matchID }, {
      onSuccess: (data, { commentID }) => {
        //? コメントの再取得。※refetch()を使うとmatchID=0での呼び出しが1回入るのでうざい
        queryClient.invalidateQueries([QUERY_KEY.comment, { id: matchID }]);
        resetLoadingState()
        setToastModal({ message: MESSAGE.COMMENT_DELETED, bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY })
        showToastModal()
        // setIsCommentDeleting(false)
        // const snapshot = queryClient.getQueryData<CommentType[]>([queryKeys.comments, { id: matchIdOnParam }])
        // const commentsWidthoutDeleteComment = snapshot!.filter(commentState => commentState.id !== commentID)
        // queryClient.setQueryData([queryKeys.comments, { id: matchIdOnParam }], commentsWidthoutDeleteComment)
        // queryClient.invalidateQueries([queryKeys.comments, { id: matchIdOnParam }])
        // setToastModalMessage({ message: MESSAGE.COMMENT_DELETED, bgColor: ModalBgColorType.DELETE })
      },
      onError: () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.COMMENT_DELETE_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
        // setIsCommentDeleting(false)
        // setToastModalMessage({ message: MESSAGE.COMMENT_DELETE_FAILED, bgColor: ModalBgColorType.ERROR })
      }
    })
  }

  return { deleteComment, isLoading, isSuccess }
}