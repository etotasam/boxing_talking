import { useCallback, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Axios } from "../axios"
import { queryKeys } from "@/libs/queryKeys"
import { useQueryState } from "@/libs/hooks/useQueryState"
//! message contoller
import { useToastModal, ModalBgColorType } from "./useToastModal";
import { MESSAGE } from "@/libs/utils";
//! hooks
import { useAuth } from "@/libs/hooks/useAuth"

export type VoteType = {
  id: number,
  match_id: number,
  user_id: number,
  vote_for: "red" | "blue"
}

//! ユーザの試合予想を取得(fetch user vote for predict of a match)
export const useFetchMatchPredictVote = () => {
  const { data: authUser } = useAuth()
  const isAuth = Boolean(authUser)
  const queryClient = useQueryClient()
  const api = useCallback(async () => {
    const res = await Axios.get<VoteType[]>(queryKeys.vote).then(v => v.data)
    return res
  }, [])
  const { data, isLoading, isRefetching } = useQuery(queryKeys.vote, api, {
    staleTime: Infinity,
    enabled: isAuth,
    onError: () => {
      queryClient.setQueryData(queryKeys.vote, [])
    }
  })
  return { data, isLoading, isRefetching }
}


//! 試合予想の投票
export const useMatchPredictVote = () => {
  const queryClient = useQueryClient()
  //? pending時にcontainerでモーダルを使う為のbool
  const { setter: setIsPendingVote } = useQueryState<boolean>("q/isPendingVote", false)
  const { data: authUser } = useAuth()
  // const {state, setter} = useQueryState(queryKeys.vote)
  const { setToastModalMessage } = useToastModal()
  type ApiPropsType = {
    matchId: number,
    vote: "red" | "blue"
  }
  const api = useCallback(async ({ matchId, vote }: ApiPropsType) => {
    await Axios.put(queryKeys.vote, {
      match_id: matchId,
      vote
    })
  }, [])
  const { mutate, isLoading } = useMutation(api, {
    onMutate: ({ matchId, vote }) => {
      setIsPendingVote(true)
      const snapshot = queryClient.getQueryData<VoteType[]>(queryKeys.vote)
      if (!authUser) return
      const newVoteData = { id: NaN, match_id: matchId, user_id: authUser.id, vote_for: vote }
      if (!Array.isArray(snapshot)) return
      queryClient.setQueryData(queryKeys.vote, [newVoteData, ...snapshot])

      return { snapshot }
    }
  })
  const matchPredictVote = ({ matchId, vote }: ApiPropsType) => {
    mutate({ matchId, vote }, {
      onSuccess: () => {
        setIsPendingVote(false)
        queryClient.invalidateQueries(queryKeys.vote)
        //? コメントの再取得(投票によるchartデータを更新させる為)
        queryClient.invalidateQueries(queryKeys.match)
        //? コメントの再取得(どっちに投票しているかを反映させる為)
        queryClient.invalidateQueries([queryKeys.comments, { id: matchId }])
        setToastModalMessage({ message: MESSAGE.VOTE_SUCCESSFULLY, bgColor: ModalBgColorType.SUCCESS })
      },
      onError: (error: any, variables, context) => {
        setIsPendingVote(false)
        queryClient.setQueryData(queryKeys.vote, context?.snapshot)
        if (error.status === 401) {
          setToastModalMessage({ message: MESSAGE.VOTE_FAILED_WITH_NO_AUTH, bgColor: ModalBgColorType.ERROR })
          return
        }
        setToastModalMessage({ message: MESSAGE.VOTE_FAILD, bgColor: ModalBgColorType.ERROR })
      }
    })
  }

  return { matchPredictVote, isLoading }
}