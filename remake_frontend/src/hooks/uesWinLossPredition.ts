import React, { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Axios } from "@/assets/axios"
//! data
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from "@/assets/statusesOnToastModal";
//! hook
import { useLoading } from "./useLoading"
import { useToastModal } from "./useToastModal";



//! 試合予想の投票
export const useMatchPrediction = () => {
  const queryClient = useQueryClient()
  const { setToastModal, showToastModal } = useToastModal()
  const { startLoading, resetLoadingState } = useLoading()
  //? pending時にcontainerでモーダルを使う為のbool
  // const { setter: setIsPendingVote } = useQueryState<boolean>("q/isPendingVote", false)
  // const { data: authUser } = useAuth()
  // const {state, setter} = useQueryState(queryKeys.vote)
  // const { setToastModalMessage } = useToastModal()
  type ApiPropsType = {
    matchID: number,
    prediction: "red" | "blue"
  }
  const api = useCallback(async ({ matchID, prediction }: ApiPropsType) => {
    await Axios.put('/api/prediction', {
      match_id: matchID,
      prediction
    })
  }, [])
  const { mutate, isLoading } = useMutation(api, {
    onMutate: () => {
      startLoading()
      // setIsPendingVote(true)
      // const snapshot = queryClient.getQueryData<VoteType[]>(queryKeys.vote)
      // if (!authUser) return
      // const newVoteData = { id: NaN, match_id: matchID, user_id: authUser.id, vote_for: vote }
      // if (!Array.isArray(snapshot)) return
      // queryClient.setQueryData(queryKeys.vote, [newVoteData, ...snapshot])

      // return { snapshot }
    }
  })
  const matchPrediction = ({ matchID, prediction }: ApiPropsType) => {
    mutate({ matchID, prediction }, {
      onSuccess: () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.SUCCESSFUL_VOTE_WIN_LOSS_PREDICTION, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
        // setIsPendingVote(false)
        // queryClient.invalidateQueries(queryKeys.vote)
        // //? コメントの再取得(投票によるchartデータを更新させる為)
        // queryClient.invalidateQueries(queryKeys.match)
        // //? コメントの再取得(どっちに投票しているかを反映させる為)
        // queryClient.invalidateQueries([queryKeys.comments, { id: matchID }])
        // setToastModalMessage({ message: MESSAGE.VOTE_SUCCESSFULLY, bgColor: ModalBgColorType.SUCCESS })
      },
      onError: (error: any, variables, context) => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.FAILED_VOTE_WIN_LOSS_PREDICTION, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
        // setIsPendingVote(false)
        // queryClient.setQueryData(queryKeys.vote, context?.snapshot)
        // if (error.status === 401) {
        //   setToastModalMessage({ message: MESSAGE.VOTE_FAILED_WITH_NO_AUTH, bgColor: ModalBgColorType.ERROR })
        //   return
        // }
        // setToastModalMessage({ message: MESSAGE.VOTE_FAILD, bgColor: ModalBgColorType.ERROR })
      }
    })
  }

  return { matchPrediction, isLoading }
}