import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
//! hooks
import {
  useInfinityFetchComments,
  useFetchNewCommentsContainer,
} from '@/hooks/useInfinityFetchComments';
//! recoil
import { useRecoilValue } from 'recoil';
import { apiFetchDataState } from '@/store/apiFetchDataState';
//! component
import { ErrorFallback } from './components/ErrorFallback';
import { NoCommentFallback } from './components/NoCommentFallback';
import { CommentsExist } from './components/CommentsExist';

type PropsType = {
  matchId: number;
};
export const Comments = (props: PropsType) => {
  const { matchId } = props;
  const {
    data: comments,
    refetch: refetchComments,
    isNextComments,
    isError: isErrorFetchComments,
  } = useInfinityFetchComments(matchId);

  const {
    data: newComments,
    refetch: refetchNewComments,
    isStale,
  } = useFetchNewCommentsContainer({
    matchId,
    resentPostTime: comments && !!comments.length ? comments[0].createdAt : null,
  });

  //? コメント投稿が成功したら新しいコメントをrefetchする
  const isNewPostSuccess = useRecoilValue(
    apiFetchDataState({ dataName: 'comments/post', state: 'isSuccess' })
  );

  useEffect(() => {
    if (!isNewPostSuccess) return;
    refetchNewComments();
  }, [isNewPostSuccess]);

  const isComments =
    (comments !== undefined && !!comments.length) ||
    (newComments !== undefined && !!newComments.length);

  const isNotComments =
    comments !== undefined && !comments.length && newComments !== undefined && !newComments.length;

  //?エラー時
  if (isErrorFetchComments) return <ErrorFallback />;

  //? コメントがない時
  if (isNotComments) return <NoCommentFallback />;

  return (
    <CommentsExist
      comments={comments}
      newComments={newComments}
      isComments={isComments}
      isNextComments={isNextComments}
      isStale={isStale}
      fetchNextComments={refetchComments}
    />
  );
};
