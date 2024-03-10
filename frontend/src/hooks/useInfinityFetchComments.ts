import { useFetchCommentsNew, useFetchCommentsState } from '@/hooks/apiHooks/useComment';
import { useEffect } from 'react';
import { useQueryState } from '@/hooks/apiHooks/useQueryState';
import { CommentType } from '@/assets/types';


type PropsType = {
  matchId: number
}
export const useInfinityFetchComments = (props: PropsType) => {
  const { matchId } = props

  const [commentsData, setCommentsData] = useQueryState<{ page: number; comments: CommentType[] }>([
    'comments',
    { matchId },
  ]);

  const { data: commentState } = useFetchCommentsState(matchId);

  const {
    refetch: commentsRefetch,
    data: FetchedComments,
    isRefetching,
  } = useFetchCommentsNew({
    matchId,
    createdAt: commentState ? commentState.resentPostTime : '',
    page: commentsData ? commentsData.page + 1 : 1,
  });

  useEffect(() => {
    if (!FetchedComments) return;
    if (!commentState) return;
    setCommentsData((current) => {
      if (!current) return { page: 1, comments: FetchedComments };
      if (current.page >= commentState.maxPage) return current;
      return { page: ++current.page, comments: [...current.comments, ...FetchedComments] };
    });
  }, [FetchedComments]);

  useEffect(() => {
    if (!commentState) return;
    if (commentsData && commentsData.comments) return;
    commentsRefetch();
  }, [commentState]);

  const refetch = () => {
    if (commentState) {
      if (commentsData.page >= commentState.maxPage) return;
      if (isRefetching) return;
      commentsRefetch();
    }
  };

  const data = commentsData ? commentsData.comments : undefined
  return { data, refetch }
}
