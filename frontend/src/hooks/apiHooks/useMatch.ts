import { useCallback, useEffect } from "react"
import { Axios } from "@/assets/axios"
// import dayjs from "dayjs"
import { useQuery, useMutation } from "react-query"
import { API_PATH } from "@/assets/apiPath"
// ! data
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from "@/assets/statusesOnToastModal"
import { QUERY_KEY } from "@/assets/queryKeys"
// ! types
import { MatchDataType, MatchResultType, RegisterMatchPropsType, MatchUpdateFormType } from "@/assets/types"
// ! hook
import { useToastModal } from "../useToastModal"
import { useLoading } from "../useLoading"


//! 試合情報の取得(1試合)
export const useFetchMatchById = (matchId: number) => {
  const api = useCallback(async () => {
    const res = await Axios.get(`${API_PATH.MATCH}/${matchId}/show`).then(result => result.data)
    return res.data
  }, [])
  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType>([QUERY_KEY.MATCH_SINGLE, { "id": matchId }], api, { keepPreviousData: true, staleTime: Infinity, enabled: true })
  return { data, isLoading, isError, isRefetching, refetch }
}

//! 試合情報一覧の取得
export const useFetchMatches = () => {
  const fetcher = useCallback(async () => {
    const res = await Axios.get(API_PATH.MATCH).then(result => result.data)
    return res.data
  }, [])
  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType[]>(QUERY_KEY.FETCH_MATCHES, fetcher, { keepPreviousData: true, staleTime: Infinity, enabled: true })
  return { data, isLoading, isError, isRefetching, refetch }
}

//! 過去の試合情報一覧の取得(試合後2週間以上経っている試合全部)
export const useFetchPastMatches = () => {
  const { startLoading, resetLoadingState } = useLoading()
  const fetcher = useCallback(async () => {
    startLoading()
    const res = await Axios.get(API_PATH.MATCH, { params: { range: "past" } }).then(result => result.data)
    return res.data
  }, [])
  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType[]>(QUERY_KEY.FETCH_PAST_MATCHES, fetcher, {
    keepPreviousData: true, staleTime: Infinity, enabled: true, onSettled: () => {
      resetLoadingState()
    }
  })



  return { data, isLoading, isError, isRefetching, refetch }
}

//! すべての試合情報の取得(過去含めすべて)
export const useFetchAllMatches = () => {
  const fetcher = useCallback(async () => {
    const res = await Axios.get<{ data: MatchDataType[] }>(API_PATH.MATCH, { params: { range: "all" } }).then(result => result.data)
    return res.data
  }, [])
  const { data, isLoading, isError, isRefetching, refetch } = useQuery<MatchDataType[]>(QUERY_KEY.FETCH_ALL_MATCHES, fetcher, { keepPreviousData: true, staleTime: Infinity, enabled: true })
  return { data, isLoading, isError, isRefetching, refetch }
}

//! 試合の登録
export const useRegisterMatch = () => {
  const { setToastModal, showToastModal } = useToastModal()
  const { refetch: refetchMatches } = useFetchMatches()
  const { refetch: refetchAllMatches } = useFetchAllMatches()
  // const queryClient = useQueryClient()
  const { resetLoadingState, startLoading } = useLoading()


  const api = async ({ matchDate, redBoxerId, blueBoxerId, grade, country, venue, weight, titles }: RegisterMatchPropsType) => {
    await Axios.post(API_PATH.MATCH, { matchDate, redBoxerId, blueBoxerId, grade, country, venue, weight, titles })
  }
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })

  const registerMatch = ({ matchDate, redBoxerId, blueBoxerId, grade, country, venue, weight, titles }: RegisterMatchPropsType) => {
    mutate({ matchDate, redBoxerId, blueBoxerId, grade, country, venue, weight, titles }, {
      onSuccess: () => {
        refetchMatches()
        refetchAllMatches()
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
  changeData: Partial<MatchUpdateFormType>
}
export const useUpdateMatch = () => {
  const { setToastModal, showToastModal } = useToastModal()
  const { resetLoadingState, startLoading } = useLoading()
  const { refetch: refetchMatches } = useFetchMatches()
  const { refetch: refetchAllMatches } = useFetchAllMatches()
  const api = useCallback(async (arg: ArgumentType) => {
    const updateData = {
      matchId: arg.matchId,
      updateMatchData: arg.changeData
    }
    await Axios.patch(API_PATH.MATCH, updateData)
  }, [])
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })
  const updateMatch = (updateMatchData: ArgumentType) => {
    mutate(updateMatchData, {
      onSuccess: () => {
        refetchMatches()
        refetchAllMatches()
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_UPDATE_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
      },
      onError: () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_UPDATE_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      },
      onSettled: () => {
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
  const { refetch: refetchAllMatches } = useFetchAllMatches()
  // const { state: matchesState, setter: setMatchesState } = useQueryState<MatchesType[]>(queryKeys.match)
  const api = useCallback(async (matchId: number) => {
    await Axios.delete(API_PATH.MATCH, { data: { matchId } })
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })

  const deleteMatch = (matchId: number) => {
    mutate(matchId, {
      onSuccess: () => {
        refetchMatches()
        refetchAllMatches()
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_DELETED, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
      },
      onError: () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_DELETE_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }

  return { deleteMatch, isLoading, isSuccess }
}

//! 試合結果の登録
export const useMatchResult = () => {
  const { setToastModal, showToastModal } = useToastModal()
  const { refetch: refetchMatches } = useFetchMatches()
  const { refetch: refetchAllMatches } = useFetchAllMatches()
  const { resetLoadingState, startLoading } = useLoading()

  const api = async (resultData: MatchResultType) => {
    await Axios.post(`${API_PATH.MATCH_RESULT}`, resultData)
  }
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })

  const storeMatchResult = ({ matchId, result, detail, round }: MatchResultType) => {
    mutate({ matchId, result, detail, round }, {
      onSuccess: () => {
        refetchMatches()
        refetchAllMatches()
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_RESULT_STORED, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
      },
      onError: () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.MATCH_RESULT_STORE_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }

  return { storeMatchResult, isLoading, isSuccess }
}


export const useInfinityFetch = ({ page, limit }: { page?: number, limit?: number }) => {
  const { resetLoadingState, startLoading } = useLoading()

  const limitNum = limit ?? 15
  const pageNum = page ?? 1
  const api = async () => {
    const res = await Axios.get<{ page: number, matches: MatchDataType[] }>(API_PATH.MATCH_INFINITY, { params: { page: pageNum, limit: limitNum } }).then(result => result.data)
    return res ?? []
  }

  const { data, refetch, isLoading, isRefetching } = useQuery([API_PATH.MATCH_INFINITY, { page: pageNum }], api, {
    keepPreviousData: true, staleTime: Infinity, onSettled: () => {
      resetLoadingState()
    }
  })

  useEffect(() => {
    if (isLoading) {
      startLoading()
    }
  }, [isLoading])

  return { data, refetch, isLoading, isRefetching }
}