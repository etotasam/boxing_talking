import { useInfiniteQuery } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import type { ApiFetchStateType } from '@/store/apiFetchDataState';
import type { FetchCommentsInfinityResponse } from './types';

export const useFetchComments = (matchId: number) => {
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

  const commentFetchState: ApiFetchStateType = commentsQuery.isError
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
