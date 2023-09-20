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
// import { useEitherAuth } from "./useEitherAuth";


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
  const { mutate, isLoading, isSuccess } = useMutation(api, {
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
  const matchVotePrediction = ({ matchID, prediction }: ApiPropsType) => {
    mutate({ matchID, prediction }, {
      onSuccess: () => {
        refetchAllFetchMatchPredictionOfAuthUser()
        refetchMatches()
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
      onError: (error: any) => {
        resetLoadingState()
        if (error.data.message === "Cannot win-loss prediction after match date") {
          setToastModal({ message: MESSAGE.MATCH_IS_ALREDY_DONE, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
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

  return { matchVotePrediction, isLoading, isSuccess }
}