import { Axios } from "../axios";
import { FighterType } from "@/libs/hooks/fetchers";


export const updateFighter = async (updateFighterData: FighterType): Promise<Record<string, string>> => {
  const { data } = await Axios.put("api/fighter/update", updateFighterData);
  return data
}
