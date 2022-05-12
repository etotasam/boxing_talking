import { Axios } from "@/libs/axios"

export const voteAPI = async (voteColor: "red" | "blue", matchId: number) => {
  const value = await Axios.put(`/api/${matchId}/${voteColor}/vote`);
  return value
}