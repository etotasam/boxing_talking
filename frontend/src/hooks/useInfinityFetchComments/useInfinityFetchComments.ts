import { isEqual } from "lodash"
import { useFetchNewComments, useFetchComments, useFetchCommentsState } from '@/hooks/apiHooks/useComment';
import { useEffect } from 'react';
import { useQueryState } from '@/hooks/apiHooks/useQueryState';
import { CommentType } from '@/assets/types';
//! Recoil
import { useSetRecoilState } from "recoil"
import { apiFetchDataState } from "@/store/apiFetchDataState"
import dayjs from "dayjs";

export const useInfinityFetchComments = (matchId: number) => {

  //? どこまで取得したかのpage数と取得したコメントはmergeしてキャッシュしておく
  const [commentsData, setCommentsData] = useQueryState<{ page: number; comments: CommentType[] }>([
    'cache/comments',
    { matchId },
  ]);

  //? データがまだ取得出来てない場合loadingモーダルを表示する為のエフェクトとrecoil
  const setIsLoading = useSetRecoilState(apiFetchDataState({ dataName: "comments/fetch", state: "isLoading" }))
  useEffect(() => {
    setIsLoading(!commentsData)
  }, [commentsData])


  //? 取得するコメントの数に基づくmaxPage数と最後の投稿のcreateAtタイムを取得
  const { data: commentState } = useFetchCommentsState(matchId);

  //? コメントの取得
  const {
    refetch: commentsRefetch,
    data: FetchedComments,
    isRefetching,
    isError
  } = useFetchComments({
    matchId,
    createdAt: commentState ? commentState.resentPostTime : '',
    page: commentsData ? commentsData.page + 1 : 1,
  });

  //? 取得したデータをcommentsDataにmergeしてキャッシュする
  useEffect(() => {
    if (!FetchedComments) return;
    if (!commentState) return;
    setCommentsData((current) => {
      if (!current) return { page: 1, comments: FetchedComments };
      if (current.page >= commentState.maxPage) return current;
      return { page: ++current.page, comments: [...current.comments, ...FetchedComments] };
    });
  }, [FetchedComments]);

  //? 初期fetchの実行 useQueryのenabledはfalseにしているのでページ読み込み完了後に実行させてる
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


  const isNextComments = (commentState && commentsData && (commentState.maxPage > commentsData.page)) || isRefetching

  const data = commentsData ? commentsData.comments : undefined
  // const resentPostTime = commentState ? commentState.resentPostTime : undefined
  return { data, refetch, isError, isRefetching, isNextComments }
}



export const useFetchNewCommentsContainer = ({ matchId, resentPostTime }: { matchId: number, resentPostTime: string | null }) => {

  //? ここに新しいコメントをキャッシュしておく
  const [newCommentsData, setNewCommentsData] = useQueryState<CommentType[] | undefined>([
    'cache/comments/new',
    { matchId },
  ]);

  const newestPostTime = (newCommentsData && !!newCommentsData.length) ? newCommentsData[0].createdAt : resentPostTime
  const { data: newComments, refetch, isStale } = useFetchNewComments({ matchId, createdAt: newestPostTime })
  useEffect(() => {
    if (!newComments) return
    if (!newComments.length) return
    setNewCommentsData(current => {
      if (!current) return newComments
      return [...newComments, ...current]
    })
  }, [newComments])

  // console.log("new", newComments);
  // console.log("cache", newCommentsData);
  const data = newCommentsData ?? []
  return { data, refetch, isStale }

}