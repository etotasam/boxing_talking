import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Axios } from "../axios"
import { queryKeys } from "@/libs/queryKeys"
import { FighterType } from "@/libs/hooks/useFighter"

//? 試合データ
export type MatchesType = {
  id: number;
  date: Date;
  red: FighterType;
  blue: FighterType;
  count_red: number;
  count_blue: number;
};

export const useFetchMatches = () => {
  const fetcher = useCallback(async () => {
    try {
      return await Axios.get("api/match").then(value => value.data)
    } catch (error) {
      console.log("試合情報の取得に失敗しました");
    }
  }, [])
  const { data, isLoading, isError, isRefetching } = useQuery<MatchesType[]>(queryKeys.fetchMatches, fetcher)
  return { data, isLoading, isError, isRefetching }
}