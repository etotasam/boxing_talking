import { useCallback, useEffect } from "react"
import { useQuery, useMutation, } from "react-query"
import { Axios } from "@/assets/axios"
import { API_PATH } from "@/assets/apiPath"
//! data
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from "@/assets/statusesOnToastModal";
import { QUERY_KEY } from "@/assets/queryKeys";
//! hook
import { useLoading } from "../useLoading"
import { useToastModal } from "../useToastModal";

import { useGuest, useAuth } from "./useAuth";
//! types
import { PredictionType, MatchPredictionsType } from "@/assets/types"
//! Recoil
import { useRecoilState } from "recoil"
import { apiFetchDataState } from "@/store/apiFetchDataState"


//! ユーザーの勝敗予想の取得
export const useFetchUsersPrediction = () => {
  const { data: authUser } = useAuth()
  const { data: isGuest } = useGuest()
  const isAuthOrGuest = Boolean(authUser || isGuest)

  const api = useCallback(async () => {
    const res = await Axios.get<{ data: PredictionType[] | null }>(API_PATH.PREDICTION).then(v => v.data)
    // console.log(res.data);
    const formattedData = res.data === null ? undefined : res.data
    return formattedData
  }, [])
  const { data, isLoading: isUserPredictionLoading, isRefetching, refetch } = useQuery(QUERY_KEY.PREDICTION, api, {
    staleTime: Infinity,
    enabled: isAuthOrGuest,
    onError: () => {
      // queryClient.setQueryData(queryKeys.vote, [])
    },
    onSuccess: () => {

    }
  })

  const [isLoading, setIsLoading] = useRecoilState(apiFetchDataState({ dataName: "userPrediction/fetch", state: "isLoading" }))


  useEffect(() => {
    setIsLoading(isUserPredictionLoading)
  }, [isUserPredictionLoading])


  return { data, isLoading, isRefetching, refetch }
}

//! 試合予想の投票
export const useVoteMatchPrediction = () => {
  // const queryClient = useQueryClient()
  const { refetch: refetchAllFetchMatchPredictionOfAuthUser } = useFetchUsersPrediction()
  // const { refetch: refetchMatches } = useFetchMatches()
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
  const { mutate, isLoading: isMutateLoading, isSuccess: isMutateSuccess, isError } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })
  const matchVotePrediction = ({ matchId, prediction }: ApiPropsType) => {
    mutate({ matchId, prediction }, {
      onSettled: () => {
        resetLoadingState()
      },
      onSuccess: () => {
        refetchAllFetchMatchPredictionOfAuthUser()
        setToastModal({ message: MESSAGE.SUCCESSFUL_VOTE_WIN_LOSS_PREDICTION, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
      },
      onError: (error: any) => {

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

  const [isSuccess, setIsSuccess] = useRecoilState(apiFetchDataState({ dataName: "userPrediction/post", state: "isSuccess" }))
  const [isLoading, setIsLoading] = useRecoilState(apiFetchDataState({ dataName: "userPrediction/post", state: "isLoading" }))

  useEffect(() => {
    setIsSuccess(isMutateSuccess)
  }, [isMutateSuccess])

  useEffect(() => {
    setIsLoading(isMutateLoading)
  }, [isMutateLoading])

  return { matchVotePrediction, isLoading, isSuccess, isError }
}

//!試合予想の投票数の取得
export const useMatchPredictions = (matchId: number) => {

  const api = useCallback(async () => {
    const res = await Axios.get<{ data: MatchPredictionsType }>(API_PATH.MATCH_PREDICTION, { params: { match_id: matchId } }).then(v => v.data)
    return res.data
  }, [])

  const { data, isLoading: isMatchPredictionLoading, isRefetching, refetch } = useQuery([QUERY_KEY.MATCH_PREDICTIONS, { id: matchId }], api, {
    staleTime: 5 * 60 * 1000,
    onError: () => {
    },
    onSettled: () => {

    }
  })

  //? 5分毎にrefetch
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);


  const [isLoading, setIsLoading] = useRecoilState(apiFetchDataState({ dataName: "matchPrediction/fetch", state: "isLoading" }))

  useEffect(() => {
    setIsLoading(isMatchPredictionLoading)
  }, [isMatchPredictionLoading])

  return { data, isLoading, isRefetching, refetch }
}
