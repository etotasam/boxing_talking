import axios from "../axios";
import { FighterType } from "@/libs/types/fighter";

type Props = {
  inputFighterInfo: FighterType
}

export const updateFighter = async ({ inputFighterInfo }: Props): Promise<Record<string, string>> => {
  const { data } = await axios.put("api/fighter/update", inputFighterInfo);
  return data
}
