import axios from "../axios"
import { FighterType } from "@/libs/types/fighter";
import useSWR, { useSWRConfig } from 'swr'

type RefetchProp = {
  refetchBool?: boolean
}

export const useFighters = () => {
  const fetcher = async () => await axios.get("api/fighter").then(value => value.data) as FighterType[]
  // const { mutate } = useSWRConfig()
  const { data, error, mutate } = useSWR("api/fighter", fetcher);
  // const refetch = (refetchBool = true) => mutate("api/fighter", refetchBool)

  return { data, error, mutate }
}

export const useMatches = () => {
  const fetcher = async () => await axios.get("api/match").then(value => value.data)
  // const { mutate } = useSWRConfig()
  const { data, error, mutate } = useSWR("api/match", fetcher);
  // const refetch = (refetchBool = true) => mutate("api/match", refetchBool)

  return { data, error, mutate }
}