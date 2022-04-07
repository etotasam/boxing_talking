import axios from "@/libs/axios"

export const voteAPI = async (voteColor: "red" | "blue", matchId: number) => {
  const value = await axios.put(`/api/${matchId}/${voteColor}/vote`);
  return value
}