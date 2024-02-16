import { useCallback, useEffect } from "react"
// import { useLocation } from "react-router-dom"
import { Axios } from "@/assets/axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { QUERY_KEY } from "@/assets/queryKeys"
import { API_PATH } from "@/assets/ApiPath"
//! hook
// import { useAuth } from "@/hooks/useAuth"
import { useLoading } from "@/hooks/useLoading"
import { useToastModal } from "@/hooks/useToastModal"
//! types
import { CommentType } from "@/assets/types"
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from "@/assets/statusesOnToastModal"
//! Recoil
import { useRecoilState } from "recoil"
import { apiFetchDataState } from "@/store/apiFetchDataState"

//! テストコメント取得
export const useTestFetchComments = (matchId: number, offset: number, limit: number) => {
  const { showToastModalMessage } = useToastModal()
  const api = async () => {
    try {
      return await Axios.get("/api/comment/test", {
        params: {
          match_id: matchId,
          offset,
          limit
        },
      }).then(v => v.data)
    } catch (error) {
      return null
    }
  }

  const { data, isLoading, isFetching, refetch, isError } = useQuery<CommentType[]>([QUERY_KEY.COMMENT, { id: matchId }], api, {
    staleTime: 60000, onError: (error: any) => {
      if (error.status === 419) {
        showToastModalMessage({ message: MESSAGE.SESSION_EXPIRED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        return
      }
    }
  })

  return { data, isLoading, isFetching, refetch, isError }
}

//! コメント取得
export const useFetchComments = (matchId: number) => {
  const { showToastModalMessage } = useToastModal()
  const api = async () => {
    const res = await Axios.get(API_PATH.COMMENT, {
      params: {
        match_id: matchId,
      },
    }).then(v => v.data)
    return res.data
  }

  const { data, isLoading: isCommentsLoading, isFetching, refetch, isError, isSuccess } = useQuery<CommentType[]>([QUERY_KEY.COMMENT, { id: matchId }], api, {
    staleTime: 30000, onError: (error: any) => {
      if (error.status === 419) {
        showToastModalMessage({ message: MESSAGE.SESSION_EXPIRED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        return
      }
    }
  })

  //?Recoilで管理
  const [isLoading, setIsLoading] = useRecoilState(apiFetchDataState({ dataName: "comments/fetch", state: "isLoading" }))
  useEffect(() => {
    setIsLoading(isCommentsLoading)
  }, [isCommentsLoading])

  return { data, isLoading, isFetching, refetch, isError, isSuccess }
}

//! コメント投稿
export const usePostComment = () => {
  const { showToastModalMessage } = useToastModal()
  type ApiPropsType = {
    matchId: number,
    comment: string
  }
  // const nowDate = dayjs().format('YYYY/MM/DD H:mm')
  //? コメントの改行は5行までに書き換える
  const sanitizeComment = (commentText: string) => {
    commentText = commentText.trim();

    commentText = commentText.replace(/\n{4,}/g, '\n\n\n');

    return commentText;
  }

  const queryClient = useQueryClient()
  const api = useCallback(async ({ matchId, comment }: ApiPropsType) => {
    await Axios.post(API_PATH.COMMENT, {
      match_id: matchId,
      comment: comment
    })
  }, [])

  const { mutate, isLoading: isPostLoading, isSuccess, isError } = useMutation(api, {
    onMutate: () => {
    }
  })
  const postComment = ({ matchId, comment }: ApiPropsType) => {
    const sanitizedComment = sanitizeComment(comment)
    mutate({ matchId, comment: sanitizedComment }, {
      onSuccess: () => {
        showToastModalMessage({ message: MESSAGE.COMMENT_POST_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        // ? match_idを指定してコメントを再取得
        queryClient.invalidateQueries([QUERY_KEY.COMMENT, { id: matchId }]);
        return
      },
      onError: (error: any) => {
        if (error.status === 419) {
          showToastModalMessage({ message: MESSAGE.SESSION_EXPIRED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          return
        }
        if (error.status === 401) {
          showToastModalMessage({ message: MESSAGE.FAILED_POST_COMMENT_WITHOUT_AUTH, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          return
        }
        //? 入力エラー
        if (error.status === 422) {
          const errors = error.message.errors as any
          if (errors.comment) {
            //? コメントが長すぎる(1000文字以内)
            if ((errors.comment as string[]).includes('The comment must not be greater')) {
              showToastModalMessage({ message: MESSAGE.COMMENT_IS_TOO_LONG, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
              return
            }
            //? 空のコメント
            if ((errors.comment as string[]).includes('comment is require')) {
              showToastModalMessage({ message: MESSAGE.COMMENT_IS_NOT_ENTER, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
              return
            }
          }
          //? 試合が存在しない
          if (errors.match_id) {
            if ((errors.match_id as string[]).includes('match_id is require')) {
              showToastModalMessage({ message: MESSAGE.COMMENT_POST_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
              return
            }
          }
        }
        //? コメント投稿失敗
        showToastModalMessage({ message: MESSAGE.COMMENT_POST_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        return
      }
    })
  }

  const [isLoading, setIsLoading] = useRecoilState(apiFetchDataState({ dataName: "comments/post", state: "isLoading" }))
  useEffect(() => {
    setIsLoading(isPostLoading)
  }, [isPostLoading])
  return { postComment, isLoading, isSuccess, isError }
}

//! コメントの削除
export const useDeleteComment = () => {

  type ApiPropsType = { commentID: number, matchID: number }
  const { setToastModal, showToastModal, showToastModalMessage } = useToastModal()
  const { startLoading, resetLoadingState } = useLoading()
  const queryClient = useQueryClient()

  const api = useCallback(async ({ commentID }: ApiPropsType) => {

    await Axios.delete(API_PATH.COMMENT, {
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
        queryClient.invalidateQueries([QUERY_KEY.COMMENT, { id: matchID }]);
        resetLoadingState()
        setToastModal({ message: MESSAGE.COMMENT_DELETED, bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY })
        showToastModal()
      },
      onError: (error: any) => {
        resetLoadingState()
        if (error.status === 419) {
          showToastModalMessage({ message: MESSAGE.SESSION_EXPIRED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          return
        }
        setToastModal({ message: MESSAGE.COMMENT_DELETE_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }

  return { deleteComment, isLoading, isSuccess }
}