import { Axios } from "../axios"
// import { FighterType } from "@/libs/types/fighter";
// import { MatchesType } from "@/libs/types"
import useSWR from 'swr'
import { UserType } from "@/libs/apis/authAPI";

//! 選手データ
export enum Stance {
  Southpaw = "southpaw",
  Orthodox = "orthodox",
}

export enum Nationality {
  Japan = "Japan",
  Mexico = "Mexico",
  USA = "USA",
  Kazakhstan = "Kazakhstan",
  UK = "UK",
  Rusia = "Rusia",
  Philpin = "Philpin"
}

export type FighterType = {
  id: number,
  name: string,
  country: Nationality | undefined,
  birth: string;
  height: number | undefined,
  stance: Stance,
  ko: number,
  win: number,
  lose: number,
  draw: number
}

export const useFighters = () => {
  const fetcher = async () => await Axios.get("api/fighter").then(value => value.data) as FighterType[]
  const { data, error, mutate } = useSWR("api/fighter", fetcher);

  return { data, error, mutate }
}

//! 試合データ
export type MatchesType = {
  id: number;
  date: Date;
  red: FighterType;
  blue: FighterType;
  count_red: number;
  count_blue: number;
};

export const useMatches = () => {
  const fetcher = async () => await Axios.get("api/match").then(value => value.data) as MatchesType[]
  const { data, error, mutate } = useSWR("api/match", fetcher);

  return { data, error, mutate }
}

//! コメント取得(試合ごと)
export type CommentType = {
  id: number;
  user: UserType;
  comment: string;
  created_at: Date;
};

export const useCommentsOnMatch = (matchId: number) => {
  const fetcher = async () => await Axios.get("api/comment", {
    params: {
      match_id: matchId,
    },
  }).then(value => value.data) as CommentType[]
  const { data, error, mutate } = useSWR("api/comment", fetcher)

  return { data, error, mutate }
}