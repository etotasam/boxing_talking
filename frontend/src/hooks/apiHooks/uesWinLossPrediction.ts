import { useCallback } from "react"
import { useQuery, useMutation, } from "react-query"
import { Axios } from "@/assets/axios"
import { API_PATH } from "@/assets/apiPath"
//! data
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from "@/assets/statusesOnToastModal";
import { QUERY_KEY } from "@/assets/queryKeys";
//! hook
import { useLoading } from "../useLoading"
import { useToastModal } from "../useToastModal";
import { useFetchMatches } from "./useMatch";
import { useGuest, useAuth } from "./useAuth";
//! types
import { PredictionType } from "@/assets/types"



//! ユーザーの勝敗予想の取得
export const useAllFetchMatchPredictionOfAuthUser = () => {
  const { data: authUser } = useAuth()
  const { data: isGuest } = useGuest()
  const isAuthOrGuest = Boolean(authUser || isGuest)

  const api = useCallback(async () => {
    const res = await Axios.get<{ data: PredictionType[] | "" }>(API_PATH.PREDICTION).then(v => v.data)
    const formattedData = res.data === "" ? undefined : res.data
    return formattedData
  }, [])
  const { data, isLoading, isRefetching, refetch } = useQuery(QUERY_KEY.PREDICTION, api, {
    staleTime: Infinity,
    enabled: isAuthOrGuest,
    onError: () => {
      // queryClient.setQueryData(queryKeys.vote, [])
    },
    onSuccess: () => {

    }
  })
  return { data, isLoading, isRefetching, refetch }
}

//! 試合予想の投票
export const useVoteMatchPrediction = () => {
  // const queryClient = useQueryClient()
  const { refetch: refetchAllFetchMatchPredictionOfAuthUser } = useAllFetchMatchPredictionOfAuthUser()
  const { refetch: refetchMatches } = useFetchMatches()
  const { setToastModal, showToastModal } = useToastModal()
  const { startLoading, resetLoadingState } = useLoading()
  type ApiPropsType = {
    matchId: number,
    prediction: "red" | "blue"
  }

  const api = useCallback(async ({ matchId, prediction }: ApiPropsType) => {
    await Axios.post(API_PATH.PREDICTION, {
      matchId: matchId,
      prediction
    })
  }, [])
  const { mutate, isLoading, isSuccess, isError } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })
  const matchVotePrediction = ({ matchId, prediction }: ApiPropsType) => {
    mutate({ matchId, prediction }, {
      onSuccess: () => {
        refetchAllFetchMatchPredictionOfAuthUser()
        refetchMatches()
        resetLoadingState()
        setToastModal({ message: MESSAGE.SUCCESSFUL_VOTE_WIN_LOSS_PREDICTION, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
      },
      onError: (error: any) => {
        resetLoadingState()
        if (error.data.message === "Cannot win-loss prediction after match date") {
          setToastModal({ message: MESSAGE.MATCH_IS_ALREADY_DONE, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          showToastModal()
          return
        }
        if (error.data.message === "Cannot win-loss prediction. You have already done.") {
          setToastModal({ message: MESSAGE.ALREADY_HAVE_DONE_VOTE, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          showToastModal()
          return
        }
        setToastModal({ message: MESSAGE.FAILED_VOTE_WIN_LOSS_PREDICTION, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }

  return { matchVotePrediction, isLoading, isSuccess, isError }
}
