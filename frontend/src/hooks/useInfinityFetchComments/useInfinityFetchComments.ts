import { useFetchNewComments } from '@/hooks/apiHooks/comment';
import { useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import { CommentType } from '@/types';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import type { FetchCommentsInfinityResponse } from '@/hooks/apiHooks/comment/types';
import type { ApiFetchStateType } from '@/store/apiFetchDataState';

export const useInfinityFetchComments = (matchId: number) => {
  const commentsQuery = useInfiniteQuery<FetchCommentsInfinityResponse>(
    [QUERY_KEY.COMMENT, { matchId }],
    async ({ pageParam }) => {
      const res = await Axios.get(API_PATH.COMMENT, {
        params: {
          matchId,
          cursor: pageParam,
        },
      }).then((v) => v.data as FetchCommentsInfinityResponse);

      return res;
    },
    {
      keepPreviousData: false,
      getNextPageParam: (lastPage) => {
        return lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined;
      },
    }
  );

  const commentFetchState: ApiFetchStateType =
    commentsQuery.isError
      ? 'error'
      : commentsQuery.isLoading
        ? 'loading'
        : commentsQuery.isFetchingNextPage
          ? 'refetching'
          : 'idle';

  const refetchComments = () => {
    if (!commentsQuery.hasNextPage) return;
    if (commentsQuery.isFetchingNextPage) return;

    commentsQuery.fetchNextPage();
  };

  const isNextComments = !!commentsQuery.hasNextPage || commentsQuery.isFetchingNextPage;

  const data = commentsQuery.data?.pages.flatMap((page) => page.data);
  return { data, refetchComments, commentFetchState, isNextComments };
};

export const useFetchNewCommentsContainer = ({
  matchId,
  resentPostTime,
}: {
  matchId: number;
  resentPostTime: string | null;
}) => {
  //? ここに新しいコメントをキャッシュしておく
  const queryClient = useQueryClient();
  const newCommentsCacheKey = useMemo(() => ['cache/comments/new', { matchId }], [matchId]);
  const { data: newCommentsData } = useQuery<CommentType[] | undefined>(newCommentsCacheKey, {
    enabled: false,
    staleTime: Infinity,
    keepPreviousData: true,
  });

  const newestPostTime =
    newCommentsData && !!newCommentsData.length ? newCommentsData[0].createdAt : resentPostTime;
  const {
    data: newComments,
    refetch,
    isStale,
  } = useFetchNewComments({
    matchId,
    createdAt: newestPostTime,
  });
  useEffect(() => {
    if (!newComments) return;
    if (!newComments.length) return;
    queryClient.setQueryData<CommentType[] | undefined>(newCommentsCacheKey, (current) => {
      if (!current) return newComments;
      return [...newComments, ...current];
    });
  }, [newComments, newCommentsCacheKey, queryClient]);

  // console.log("new", newComments);
  // console.log("cache", newCommentsData);
  const data = newCommentsData ?? [];
  return { data, refetch, isStale };
};
