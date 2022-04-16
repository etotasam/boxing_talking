import axios from "../axios";

export type FighterType = {
  id: number,
  name: string,
  country: string,
  ko: number,
  win: number,
  lose: number,
  draw: number
}

export type MatchesType = {
  id: number;
  date: string;
  red: FighterType;
  blue: FighterType;
  count_red: number;
  count_blue: number;
};

export const fetchMatchesAPI = async (): Promise<MatchesType[]> => {
  const { data } = await axios.get(
    "api/match"
  );
  return data
}