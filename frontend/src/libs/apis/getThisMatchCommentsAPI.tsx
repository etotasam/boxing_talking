//! コメントの取得
import { UserType } from "@/store/slice/authUserSlice";
import axios from "@/libs/axios";

export type CommentType = {
  id: number;
  user: UserType;
  comment: string;
  created_at: Date;
};

const getThisMatchCommentsAPI = async (
  matchId: number
): Promise<CommentType[]> => {
  const { data: commentData }: { data: CommentType[] } = await axios.get(
    "api/get_comments",
    {
      params: {
        match_id: matchId,
      },
    }
  );
  return commentData;
};

export default getThisMatchCommentsAPI;
