import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useQuery, useQueryClient, keepPreviousData, skipToken } from '@tanstack/react-query';
import { useRecoilState } from 'recoil';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { apiFetchState } from '@/store/apiFetchDataState';
import type { CommentType } from '@/types';
import type { FetchNewCommentsParams } from './types';

const useFetchNewCommentsQuery = ({ matchId, createdAt }: FetchNewCommentsParams) => {
  const sanitizeTime = createdAt ?? dayjs().subtract(1, 'minute').format('YYYY-MM-DD H:mm:ss');

  const api = async () => {
    const res = await Axios.get(API_PATH.COMMENT_NEW, {
      params: {
        matchId,
        createdAt: sanitizeTime,
      },
    }).then((v) => v.data);
    return res.data;
  };

  const { data, refetch, isFetching, isError, isStale } = useQuery<CommentType[]>({
    queryKey: [QUERY_KEY.COMMENT_NEW, { matchId }],
    queryFn: api,
    gcTime: 0,
    staleTime: 500,
    enabled: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const [newCommentFetchState, setNewCommentFetchState] = useRecoilState(
    apiFetchState('comments/fetch')
  );
  useEffect(() => {
    if (isFetching) {
      setNewCommentFetchState('refetching');
    } else if (isError) {
      setNewCommentFetchState('error');
    } else {
      setNewCommentFetchState('idle');
    }
  }, [isFetching, isError, setNewCommentFetchState]);

  return { data, refetch, isStale, newCommentFetchState };
};

export const useFetchNewComments = ({
  matchId,
  resentPostTime,
}: {
  matchId: number;
  resentPostTime: string | null;
}) => {
  //? ここに新しいコメントをキャッシュしておく
  const queryClient = useQueryClient();
  const newCommentsCacheKey = useMemo(() => ['cache/comments/new', { matchId }], [matchId]);
  const { data: newCommentsData } = useQuery<CommentType[] | undefined>({
    queryKey: newCommentsCacheKey,
    queryFn: skipToken,
    enabled: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });

  const newestPostTime =
    newCommentsData && !!newCommentsData.length ? newCommentsData[0].createdAt : resentPostTime;
  const {
    data: newComments,
    refetch,
    isStale,
  } = useFetchNewCommentsQuery({
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

  const data = newCommentsData ?? [];
  return { data, refetch, isStale };
};
