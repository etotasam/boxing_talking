import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Axios } from "../axios"
import { queryKeys } from "@/libs/queryKeys"
import { useQueryState } from "./useQueryState"
import { useMessageController } from "@/libs/hooks/messageController";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";
import dayjs from "dayjs"
//! types
import { FighterType } from "@/libs/hooks/useFighter"

//? 試合データ
export type MatchesType = {
  id: number;
  date: Date | string;
  red: FighterType;
  blue: FighterType;
  count_red: number;
  count_blue: number;
};

//! 試合情報の取得
export const useFetchMatches = () => {
  const fetcher = useCallback(async () => {
    return await Axios.get("api/match").then(value => value.data)
  }, [])
  const { data, isLoading, isError, isRefetching } = useQuery<MatchesType[]>(queryKeys.match, fetcher)
  return { data, isLoading, isError, isRefetching }
}

//! 試合の登録
type RegstarMatchPropsType = {
  red_fighter: FighterType,
  blue_fighter: FighterType,
  match_date: string
}

type RegstarMatchAPIPropsType = {
  red_fighter_id: number,
  blue_fighter_id: number,
  match_date: string
}

export const useRegisterMatch = () => {
  const { setMessageToModal } = useMessageController()
  const queryClient = useQueryClient()
  const api = async ({ red_fighter, blue_fighter, match_date }: RegstarMatchPropsType) => {
    await Axios.post(queryKeys.match, { red_fighter_id: red_fighter.id, blue_fighter_id: blue_fighter.id, match_date })
  }
  const { mutate, isLoading } = useMutation(api, {
    onMutate: (variables) => {
      const snapshot = queryClient.getQueryData<MatchesType[]>(queryKeys.match)
      const dumyRegistMatch: MatchesType = { id: 0, date: variables.match_date, red: variables.red_fighter, blue: variables.blue_fighter, count_blue: 0, count_red: 0 }
      const sorfFunc = (a: MatchesType, b: MatchesType) => {
        return dayjs(a.date).unix() - dayjs(b.date).unix()
      }
      const dumyMatches = [...snapshot!, dumyRegistMatch].sort(sorfFunc)
      queryClient.setQueryData(queryKeys.match, dumyMatches)
      return { snapshot }
    }
  })

  const registerMatch = ({ red_fighter, blue_fighter, match_date }: RegstarMatchPropsType) => {
    mutate({ red_fighter, blue_fighter, match_date }, {
      onSuccess: () => {
        setMessageToModal(MESSAGE.MATCH_REGISTER_SUCCESS, ModalBgColorType.SUCCESS)
      },
      onError: (data, variables, context) => {
        queryClient.setQueryData(queryKeys.match, context?.snapshot)
        setMessageToModal(MESSAGE.MATCH_REGISTER_FAILD, ModalBgColorType.ERROR)
      }
    })
  }

  return { registerMatch, isLoading }
}

//! 試合の削除
export const useDeleteMatch = () => {
  const { setMessageToModal } = useMessageController()
  const { state: matchesState, setter: setMatchesState } = useQueryState<MatchesType[]>(queryKeys.match)
  const api = useCallback(async (matchId: number) => {
    await Axios.delete(queryKeys.match, { data: { matchId } })
  }, [])

  const { mutate, isLoading } = useMutation(api, {
    onMutate: () => {
      const snapshot = matchesState
      return { snapshot }
    }
  })

  const deleteMatch = (matchId: number) => {
    mutate(matchId, {
      onSuccess: (data, matchId, context) => {
        setMessageToModal(MESSAGE.MATCH_DELETED, ModalBgColorType.DELETE)
        const withoutDeleteMatchesState = context.snapshot.filter(match => match.id !== matchId)
        setMatchesState(withoutDeleteMatchesState)
      },
      onError: (error, matchId, context) => {
        setMessageToModal(MESSAGE.MATCH_DELETE_FAILD, ModalBgColorType.ERROR)
        setMatchesState(context!.snapshot)
      }
    })
  }

  return { deleteMatch, isLoading }
}

//! 試合日の変更

export const useUpdateMatch = () => {
  const { setMessageToModal } = useMessageController()
  const queryClient = useQueryClient()
  const api = useCallback(async (alterMatchData: MatchesType) => {
    const updateDeta = {
      id: alterMatchData.id,
      red_fighter_id: alterMatchData.red.id,
      blue_fighter_id: alterMatchData.blue.id,
      match_date: alterMatchData.date,
      count_red: alterMatchData.count_red,
      count_blue: alterMatchData.count_blue
    }
    await Axios.put(queryKeys.match, updateDeta)
  }, [])
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: (alterMatchData) => {
      const snapshot = queryClient.getQueryData<MatchesType[]>(queryKeys.match)
      if (!snapshot) return
      const newMathcesState = snapshot.map(match => {
        if (match.id === alterMatchData.id) {
          return alterMatchData
        }
        return match
      })
      queryClient.setQueryData(queryKeys.match, newMathcesState)
      return { snapshot }
    }
  })
  const updateMatch = (alterMatchData: MatchesType) => {
    mutate(alterMatchData, {
      onSuccess: (data) => {
        setMessageToModal(MESSAGE.MATCH_UPDATE_SUCCESS, ModalBgColorType.SUCCESS)
        queryClient.setQueryData(queryKeys.deleteMatchSub, undefined)
      },
      onError: (error, alterMatchData, context) => {
        setMessageToModal(MESSAGE.MATCH_UPDATE_FAILD, ModalBgColorType.ERROR)
        queryClient.setQueryData(queryKeys.match, context?.snapshot)
        queryClient.setQueryData(queryKeys.deleteMatchSub, undefined)
      }
    })
  }

  return { updateMatch, isLoading, isSuccess }
}