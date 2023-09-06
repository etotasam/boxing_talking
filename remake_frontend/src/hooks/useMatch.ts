import { useCallback } from "react"
import { Axios } from "@/assets/axios"
import dayjs from "dayjs"
import { useQuery, useMutation, useQueryClient } from "react-query"
// ! data
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from "@/assets/statusesOnToastModal"
// ! types
import { BoxerType } from "@/assets/types"
// ! hook
import { useToastModal } from "./useToastModal"
import { useLoading } from "./useLoading"

//! 試合の登録
type RegstarMatchPropsType = {
  red_boxer_id: number,
  blue_boxer_id: number,
  match_date: string,
  grade: string,
  country: string,
  venue: string,
  weight: string,
  titles: string[],
}

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