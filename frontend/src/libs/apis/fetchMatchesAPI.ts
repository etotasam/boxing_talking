import axios from "../axios";
import { Stance, Nationality, FighterType } from "@/libs/types/fighter";


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
  const { data } = await axios.get(
    "api/match"
  );
  return data
}