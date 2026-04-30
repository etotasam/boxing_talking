export type FetchCommentsStateResponse = {
  maxPage: number;
  resentPostTime: string;
};

export type FetchCommentsParams = {
  matchId: number;
  createdAt: string;
  page: number;
  limit?: number;
};

export type FetchNewCommentsParams = {
  matchId: number;
  createdAt: string | null;
};

export type PostCommentParams = {
  matchId: number;
  comment: string;
};

export type DeleteCommentParams = {
  commentID: number;
  matchID: number;
};

export type PostCommentApiError = {
  status?: number;
  message?: {
    errors?: {
      comment?: string[];
      matchId?: string[];
    };
  };
};
