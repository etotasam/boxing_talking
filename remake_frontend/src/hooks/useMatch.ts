import { useCallback } from "react"
import { Axios } from "@/assets/axios"
import dayjs from "dayjs"
import { useQuery, useMutation, useQueryClient } from "react-query"
// ! data
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from "@/assets/statusesOnToastModal"
import { QUERY_KEY } from "@/assets/queryKeys"
// ! types
import { BoxerType, MatchesDataType, RegstarMatchPropsType } from "@/assets/types"
// ! hook
import { useToastModal } from "./useToastModal"
import { useLoading } from "./useLoading"


//! 試合情報の取得
export const useFetchMatches = () => {
  const fetcher = useCallback(async () => {
    return await Axios.get("api/match").then(value => value.data)
  }, [])
  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchesDataType[]>(QUERY_KEY.matchesFetch, fetcher)
  return { data, isLoading, isError, isRefetching, refetch }
}



//! 試合の登録
export const useRegisterMatch = () => {
  const { setToastModal, showToastModal } = useToastModal()
  const queryClient = useQueryClient()
  const { resetLoadingState, startLoading } = useLoading()


  const api = async ({ match_date, red_boxer_id, blue_boxer_id, grade, country, venue, weight, titles }: RegstarMatchPropsType) => {
    await Axios.post("/api/match", { match_date, red_boxer_id, blue_boxer_id, grade, country, venue, weight, titles })
  }
  const { mutate, isLoading } = useMutation(api, {
    onMutate: (variables) => {
      startLoading()
      // const snapshot = queryClient.getQueryData<MatchesType[]>(queryKeys.match)
      // const dumyRegistMatch: MatchesType = { id: 0, date: variables.match_date, red: variables.red_fighter, blue: variables.blue_fighter, count_blue: 0, count_red: 0 }
      // const sorfFunc = (a: MatchesType, b: MatchesType) => {
      //   return dayjs(a.date).unix() - dayjs(b.date).unix()
      // }
      // const dumyMatches = [...snapshot!, dumyRegistMatch].sort(sorfFunc)
      // queryClient.setQueryData(queryKeys.match, dumyMatches)
      // return { snapshot }
    }
  })

  const registerMatch = ({ match_date, red_boxer_id, blue_boxer_id, grade, country, venue, weight, titles }: RegstarMatchPropsType) => {
    mutate({ match_date, red_boxer_id, blue_boxer_id, grade, country, venue, weight, titles }, {
      onSuccess: () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_REGISTER_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
      },
      onError: (data, variables, context) => {
        resetLoadingState()
        // queryClient.setQueryData(queryKeys.match, context?.snapshot)
        setToastModal({ message: MESSAGE.MATCH_REGISTER_FAILD, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }

  return { registerMatch, isLoading }
}


//! 試合の変更

type ArgumentType = {
  matchId: number,
  updateMatchData: Record<string, string | string[]>
}

export const useUpdateMatch = () => {
  const { setToastModal, showToastModal } = useToastModal()
  const { resetLoadingState, startLoading } = useLoading()
  const { refetch } = useFetchMatches()
  const queryClient = useQueryClient()
  const api = useCallback(async (arg: ArgumentType) => {
    const updateDeta = {
      match_id: arg.matchId,
      update_match_data: arg.updateMatchData
    }
    await Axios.put("/api/match", updateDeta)
  }, [])
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
      // const snapshot = queryClient.getQueryData<MatchesType[]>(queryKeys.match)
      // if (!snapshot) return
      // const newMathcesState = snapshot.map(match => {
      //   if (match.id === .id) {

      //     return alterMatchData
      //   }
      //   return match
      // })
      // queryClient.setQueryData(queryKeys.match, newMathcesState)
      // return { snapshot }
    }
  })
  const updateMatch = (updateMatchData: ArgumentType) => {
    mutate(updateMatchData, {
      onSuccess: (data) => {
        refetch()
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_UPDATE_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
        // setToastModalMessage({ message: MESSAGE.MATCH_UPDATE_SUCCESS, bgColor: ModalBgColorType.SUCCESS })
        // queryClient.setQueryData(queryKeys.deleteMatchSub, undefined)
      },
      onError: (error, alterMatchData, context) => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_UPDATE_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
        // queryClient.setQueryData(queryKeys.match, context?.snapshot)
        // queryClient.setQueryData(queryKeys.deleteMatchSub, undefined)
      }
    })
  }

  return { updateMatch, isLoading, isSuccess }
}