import axios from "@/libs/axios"
import { STATUS } from "@/libs/utils"

export const useCommentPost = async (userId: number, matchId: number, comment: string) => {
  if (comment === "") {
    return STATUS.COMMENT_NULL
  }
  const { status } = await axios.post(
    "api/comment",
    {
      userId,
      matchId,
      comment,
    })
  return status
}