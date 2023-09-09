import React, { useCallback } from "react"
import { Axios } from "@/assets/axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { QUERY_KEY } from "@/assets/queryKeys"
//! hook
import { useAuth } from "@/hooks/useAuth"
import { useToastModal } from "@/hooks/useToastModal"
//! types
import { UserType } from "@/assets/types"


type CommentType = {
  id: number;
  user: UserType;
  comment: string;
  vote: string | undefined;
  created_at: Date;
}



//! コメント取得
export const useFetchComments = (matchId: number) => {
  const api = async () => {
    return await Axios.get("/api/comment", {
      params: {
        match_id: matchId,
      },
    }).then(v => v.data)
  }

  const { data, isLoading, isFetching } = useQuery<CommentType[]>([QUERY_KEY.matchComments, { id: matchId }], api)

  return { data, isLoading, isFetching }
}


//! コメント投稿

export const usePostComment = () => {
  type ApiPropsType = {
    userId: string | null,
    matchId: number,
    comment: string
  }
  // const { setter: setIsCommentPosting } = useQueryState("q/isCommentPosting", false)
  const queryClient = useQueryClient()
  const { data: user } = useAuth()
  const { setToastModal } = useToastModal()
  const api = useCallback(async ({ userId, matchId, comment }: ApiPropsType) => {
    await Axios.post("/api/comment", {
      user_id: userId,
      match_id: matchId,
      comment: comment
    })
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
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
  const postComment = ({ userId, matchId, comment }: ApiPropsType) => {
    const trimmedComment = comment.trim()
    mutate({ userId, matchId, comment: trimmedComment }, {
      onSuccess: () => {
        // ? match_idを指定してコメントを再取得
        queryClient.invalidateQueries([QUERY_KEY.matchComments, { id: matchId }]);
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
  return { postComment, isLoading, isSuccess }
}