import { useCallback } from "react"
import { Axios } from "@/assets/axios"
// import dayjs from "dayjs"
import { useQuery, useMutation } from "react-query"
// ! data
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from "@/assets/statusesOnToastModal"
import { QUERY_KEY } from "@/assets/queryKeys"
// ! types
import { MatchDataType, RegisterMatchPropsType } from "@/assets/types"
// ! hook
import { useToastModal } from "./useToastModal"
import { useLoading } from "./useLoading"


//! 試合情報の取得
export const useFetchMatches = () => {
  const fetcher = useCallback(async () => {
    return await Axios.get("api/match").then(value => value.data)
  }, [])
  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType[]>(QUERY_KEY.matchesFetch, fetcher, { keepPreviousData: true, staleTime: Infinity, enabled: true })
  return { data, isLoading, isError, isRefetching, refetch }
}

//! 過去の試合情報の取得(試合後一週間以上経っている試合全部)
export const useFetchPastMatches = () => {
  const { startLoading, resetLoadingState } = useLoading()
  const fetcher = useCallback(async () => {
    startLoading()
    return await Axios.get("api/match", { params: { range: "past" } }).then(value => value.data)
  }, [])
  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType[]>(QUERY_KEY.pastMatches, fetcher, {
    keepPreviousData: true, staleTime: Infinity, enabled: true, onSuccess: () => {
      resetLoadingState()
    }, onError: () => {
      resetLoadingState()
    }
  })



  return { data, isLoading, isError, isRefetching, refetch }
}

//! すべての試合情報の取得(過去含めすべて)
export const useFetchAllMatches = () => {
  const fetcher = useCallback(async () => {
    return await Axios.get("api/match", { params: { range: "all" } }).then(value => value.data)
  }, [])
  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType[]>(QUERY_KEY.allMatches, fetcher, { keepPreviousData: true, staleTime: Infinity, enabled: true })
  return { data, isLoading, isError, isRefetching, refetch }
}



//! 試合の登録
export const useRegisterMatch = () => {
  const { setToastModal, showToastModal } = useToastModal()
  const { refetch: refetchMatches } = useFetchMatches()
  // const queryClient = useQueryClient()
  const { resetLoadingState, startLoading } = useLoading()


  const api = async ({ match_date, red_boxer_id, blue_boxer_id, grade, country, venue, weight, titles }: RegisterMatchPropsType) => {
    await Axios.post("/api/match", { match_date, red_boxer_id, blue_boxer_id, grade, country, venue, weight, titles })
  }
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
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

  const registerMatch = ({ match_date, red_boxer_id, blue_boxer_id, grade, country, venue, weight, titles }: RegisterMatchPropsType) => {
    mutate({ match_date, red_boxer_id, blue_boxer_id, grade, country, venue, weight, titles }, {
      onSuccess: () => {
        refetchMatches()
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_REGISTER_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
      },
      onError: () => {
        resetLoadingState()
        // queryClient.setQueryData(queryKeys.match, context?.snapshot)
        setToastModal({ message: MESSAGE.MATCH_REGISTER_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }

  return { registerMatch, isLoading, isSuccess }
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
    }
  })
  const updateMatch = (updateMatchData: ArgumentType) => {
    mutate(updateMatchData, {
      onSuccess: () => {
        refetch()
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_UPDATE_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
      },
      onError: () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_UPDATE_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }

  return { updateMatch, isLoading, isSuccess }
}

//! 試合の削除
export const useDeleteMatch = () => {
  const { setToastModal, showToastModal } = useToastModal()
  const { resetLoadingState, startLoading } = useLoading()
  const { refetch: refetchMatches } = useFetchMatches()
  // const { state: matchesState, setter: setMatchesState } = useQueryState<MatchesType[]>(queryKeys.match)
  const api = useCallback(async (matchId: number) => {
    await Axios.delete("/api/match", { data: { matchId } })
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
      // const snapshot = matchesState
      // return { snapshot }
    }
  })

  const deleteMatch = (matchId: number) => {
    mutate(matchId, {
      onSuccess: () => {
        refetchMatches()
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_DELETED, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
        // setToastModalMessage({ message: MESSAGE.MATCH_DELETED, bgColor: ModalBgColorType.DELETE })
        // const withoutDeleteMatchesState = context.snapshot.filter(match => match.id !== matchId)
        // setMatchesState(withoutDeleteMatchesState)
      },
      onError: () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_DELETE_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
        // setToastModalMessage({ message: MESSAGE.MATCH_DELETE_FAILED, bgColor: ModalBgColorType.ERROR })
        // setMatchesState(context!.snapshot)
      }
    })
  }

  return { deleteMatch, isLoading, isSuccess }
}