import { useCallback, useEffect } from "react"
import { useQuery, useMutation, } from "react-query"
import type { AxiosResponse } from "axios"
import { Axios } from "@/api/axios"
import { API_PATH } from "@/constants/apiPath"
//! data
import { MESSAGE } from "@/constants/statusesOnToastModal";
import { QUERY_KEY } from "@/constants/queryKeys";
//! hook
import { useFullScreenLoading } from "../useFullScreenLoading"
import { useToastModal } from "../useToastModal";

import { useGuest, useAuth } from "./useAuth";
//! types
import { PredictionType, MatchPredictionsType } from "@/types"
//! Recoil
import { useRecoilState } from "recoil"
import { apiFetchState } from "@/store/apiFetchDataState"

type PredictionErrorResponse = {
  message: string
}

//! ユーザーの勝敗予想の取得
export const useFetchUsersPrediction = () => {
  const { data: authUser } = useAuth()
  const { data: isGuest } = useGuest()
  const isAuthOrGuest = Boolean(authUser || isGuest)

  const api = useCallback(async () => {
    const res = await Axios.get<{ data: PredictionType[] | null }>(API_PATH.PREDICTION).then(v => v.data)
    const formattedData = res.data === null ? undefined : res.data
    return formattedData
  }, [])
  const { data, isLoading: isUserPredictionLoading, isRefetching, refetch } = useQuery(QUERY_KEY.PREDICTION, api, {
    staleTime: Infinity,
    enabled: isAuthOrGuest,
    onError: () => {
    },
    onSuccess: () => {

    }
  })

  const [usePredictionFetchState, setUserPredictionFetchState] = useRecoilState(apiFetchState("userPrediction/fetch"))

  useEffect(() => {
    if (isUserPredictionLoading) {
      setUserPredictionFetchState("loading")
    } else if (isRefetching) {
      setUserPredictionFetchState("refetching")
    } else {
      setUserPredictionFetchState("idle")
    }
  }, [isUserPredictionLoading, isRefetching])


  return { data, refetch, usePredictionFetchState }
}

//! 試合予想の投票
export const useVoteMatchPrediction = () => {
  const { refetch: refetchAllFetchMatchPredictionOfAuthUser } = useFetchUsersPrediction()
  const { showErrorToast, showSuccessToast } = useToastModal()
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading()
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
  const { mutate, isLoading: isMutateLoading, isSuccess: isMutateSuccess, isError } = useMutation<
    void,
    AxiosResponse<PredictionErrorResponse>,
    ApiPropsType
  >(api, {
    onMutate: () => {
      showFullScreenLoading()
    }
  })
  const matchVotePrediction = ({ matchId, prediction }: ApiPropsType) => {
    mutate({ matchId, prediction }, {
      onSettled: () => {
        hideFullScreenLoading()
      },
      onSuccess: () => {
        refetchAllFetchMatchPredictionOfAuthUser()
        showSuccessToast(MESSAGE.SUCCESSFUL_VOTE_WIN_LOSS_PREDICTION)
      },
      onError: (error: AxiosResponse<PredictionErrorResponse>) => {

        if (error.data.message === "Cannot win-loss prediction after match date") {
          showErrorToast(MESSAGE.MATCH_IS_ALREADY_DONE)
          return
        }
        if (error.data.message === "Cannot win-loss prediction. You have already done.") {
          showErrorToast(MESSAGE.ALREADY_HAVE_DONE_VOTE)
          return
        }
        showErrorToast(MESSAGE.FAILED_VOTE_WIN_LOSS_PREDICTION)
      }
    })
  }

  const [userPredictionPostState, setUserPredictionPostState] = useRecoilState(apiFetchState("userPrediction/post"))

  useEffect(() => {
    if (isMutateLoading) {
      setUserPredictionPostState("loading")
    } else if (isMutateSuccess) {
      setUserPredictionPostState("success")
    } else if (isError) {
      setUserPredictionPostState("error")
    } else {
      setUserPredictionPostState("idle")
    }
  }, [isMutateLoading, isMutateSuccess, isError])

  return { matchVotePrediction, userPredictionPostState, isSuccess: isMutateSuccess, isError }
}

//!試合予想の投票数の取得
export const useMatchPredictions = (matchId: number) => {

  const api = useCallback(async () => {
    const res = await Axios.get<{ data: MatchPredictionsType }>(API_PATH.MATCH_PREDICTION, { params: { match_id: matchId } }).then(v => v.data)
    return res.data
  }, [])

  const { data, isLoading, isRefetching, refetch } = useQuery([QUERY_KEY.MATCH_PREDICTIONS, { id: matchId }], api, {
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


  const [matchPredictionFetchState, setMatchPredictionFetchState] = useRecoilState(apiFetchState("matchPrediction/fetch"))

  useEffect(() => {
    if (isLoading) {
      setMatchPredictionFetchState("loading")
    } else if (isRefetching) {
      setMatchPredictionFetchState("refetching")
    } else {
      setMatchPredictionFetchState("idle")
    }
  }, [isLoading, isRefetching])

  return { data, matchPredictionFetchState, refetch }
}
