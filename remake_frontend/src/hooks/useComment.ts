import { useCallback } from "react"
import dayjs from "dayjs";
// import { useLocation } from "react-router-dom"
import { Axios } from "@/assets/axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { QUERY_KEY } from "@/assets/queryKeys"
//! hook
// import { useAuth } from "@/hooks/useAuth"
import { useLoading } from "@/hooks/useLoading"
import { useToastModal } from "@/hooks/useToastModal"
//! types
// import { UserType } from "@/assets/types"
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from "@/assets/statusesOnToastModal"


type CommentType = {
  id: number;
  post_user_name: string;
  // match_id: number,
  comment: string;
  prediction: "red" | "blue" | undefined;
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
      return null
    }
  }

  const { data, isLoading, isFetching, refetch, isError } = useQuery<CommentType[]>([QUERY_KEY.comment, { id: matchId }], api, {
    staleTime: 60000, onError: () => {

    }
  })

  return { data, isLoading, isFetching, refetch, isError }
}


//! コメント投稿

export const usePostComment = () => {
  const { startLoading, resetLoadingState } = useLoading()
  const { setToastModal, showToastModal } = useToastModal()
  type ApiPropsType = {
    matchId: number,
    comment: string
  }
  const nowDate = dayjs().format('YYYY/MM/DD H:mm')

  const queryClient = useQueryClient()
  const api = useCallback(async ({ matchId, comment }: ApiPropsType) => {
    // try {
    await Axios.post("/api/comment", {
      match_id: matchId,
      comment: comment
    })
    // } catch (error) {
    //   return error
    // }
  }, [])

  const { mutate, isLoading, isSuccess, isError } = useMutation(api, {
    onMutate: () => {
      startLoading()
      // const snapshot = queryClient.getQueryData<CommentType[]>([QUERY_KEY.comment, { id: matchId }])
      // queryClient.setQueryData([QUERY_KEY.comment, { id: matchId }], [{ id: NaN, post_user_name: "name", comment, created_at: nowDate }, ...snapshot!])
      // return { snapshot }
    }
  })
  const postComment = ({ matchId, comment }: ApiPropsType) => {
    const trimmedComment = comment.trim()
    mutate({ matchId, comment: trimmedComment }, {
      onSuccess: () => {
        // console.log(data);
        resetLoadingState()
        setToastModal({ message: MESSAGE.COMMENT_POST_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
        // ? match_idを指定してコメントを再取得
        queryClient.invalidateQueries([QUERY_KEY.comment, { id: matchId }]);
        return
      },
      onError: (error: any, _, context) => {
        // queryClient.setQueryData([QUERY_KEY.comment, { id: matchId }], context?.snapshot)
        if (error.status === 401) {
          resetLoadingState()
          setToastModal({ message: MESSAGE.FAILED_POST_COMMENT_WITHOUT_AUTH, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          showToastModal()
          return
        }
        setToastModal({ message: MESSAGE.COMMENT_POST_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
        return
      }
    })
  }
  return { postComment, isLoading, isSuccess, isError }
}


//! コメントの削除

export const useDeleteComment = () => {
  // const { setter: setIsCommentDeleting } = useQueryState("q/isCommentDeleting", false)
  // const { search } = useLocation();
  // const query = new URLSearchParams(search);
  // const matchIdOnParam = Number(query.get("id"));

  type ApiPropsType = { commentID: number, matchID: number }
  const { setToastModal, showToastModal } = useToastModal()
  const { startLoading, resetLoadingState } = useLoading()
  const queryClient = useQueryClient()

  const api = useCallback(async ({ commentID }: ApiPropsType) => {

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
      onSuccess: () => {
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