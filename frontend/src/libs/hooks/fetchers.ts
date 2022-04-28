import axios, { CancelToken } from "../axios"
import { FighterType } from "@/libs/types/fighter";
import useSWR, { useSWRConfig } from 'swr'


export const useFighters = () => {
  const fetcher = async () => await axios.get("api/fighter").then(value => value.data) as FighterType[]
  const { mutate } = useSWRConfig()
  const { data, error } = useSWR("api/fighter", fetcher);
  const refetch = mutate("api/fighter")

  return { data, error, refetch }
}