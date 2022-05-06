import { Axios } from "../axios";
import { Stance, Nationality, FighterType } from "@/libs/hooks/fetchers";


// export type FighterType = {
//   id: number,
//   name: string,
//   country: Nationality,
//   birth: string;
//   height: number,
//   stance: Stance,
//   ko: number,
//   win: number,
//   lose: number,
//   draw: number
// }

export type MatchesType = {
  id: number;
  date: Date;
  red: FighterType;
  blue: FighterType;
  count_red: number;
  count_blue: number;
};

export const fetchMatchesAPI = async (): Promise<MatchesType[]> => {
  const { data } = await Axios.get(
    "api/match"
  );
  return data
}

type RegstarMatchPropsType = {
  red_fighter_id: number,
  blue_fighter_id: number,
  match_date: string
}

export const registerMatchAPI = async ({ red_fighter_id, blue_fighter_id, match_date }: RegstarMatchPropsType): Promise<Record<string, string>> => {
  const { data } = await Axios.post("api/match/register", {
    red_fighter_id,
    blue_fighter_id,
    match_date
  });
  return data
}