import type { CommentType } from '@/types';

export type FetchCommentsInfinityResponse = {
  data: CommentType[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
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
