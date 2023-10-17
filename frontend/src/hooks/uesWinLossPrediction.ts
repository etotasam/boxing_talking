import { useCallback } from "react"
import { useQuery, useMutation } from "react-query"
import { Axios } from "@/assets/axios"
//! data
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from "@/assets/statusesOnToastModal";
import { QUERY_KEY } from "@/assets/queryKeys";
//! hook
import { useLoading } from "./useLoading"
import { useToastModal } from "./useToastModal";
import { useFetchMatches } from "./useMatch";
import { useGuest, useAuth } from "./useAuth";
//! types
import { PredictionType } from "@/assets/types"


//! ユーザーの勝敗予想の取得
export const useAllFetchMatchPredictionOfAuthUser = () => {
  const { data: authUser } = useAuth()
  const { data: isGuest } = useGuest()
  const isEitherAuth = Boolean(authUser || isGuest)

  const api = useCallback(async () => {
    const res = await Axios.get<PredictionType[] | "">('/api/prediction').then(v => v.data)
    let formattedData
    if (res === "") {
      formattedData = undefined
    } else {
      formattedData = res
    }
    return formattedData
  }, [])
  const { data, isLoading, isRefetching, refetch } = useQuery(QUERY_KEY.prediction, api, {
    staleTime: Infinity,
    enabled: isEitherAuth,
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
    matchID: number,
    prediction: "red" | "blue"
  }
  const api = useCallback(async ({ matchID, prediction }: ApiPropsType) => {
    await Axios.post('/api/prediction', {
      match_id: matchID,
      prediction
    })
  }, [])
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })
  const matchVotePrediction = ({ matchID, prediction }: ApiPropsType) => {
    mutate({ matchID, prediction }, {
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

  return { matchVotePrediction, isLoading, isSuccess }
}