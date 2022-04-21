import axios from "@/libs/axios"
import { STATUS } from "@/libs/utils"

type Props = { userId: number, matchId: number, comment: string }

export const commentPostAPI = async ({ userId, matchId, comment }: Props) => {
  if (comment === "") {
    return STATUS.COMMENT_NULL
  }
  const { status } = await axios.post(
    "api/comment",
    {
      user_id: userId,
      match_id: matchId,
      comment,
    })
  return status
}