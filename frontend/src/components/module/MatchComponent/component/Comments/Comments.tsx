import { useEffect } from 'react';
// import { useInView } from 'react-intersection-observer';
//! hooks
import {
  useInfinityFetchComments,
  useFetchNewCommentsContainer,
} from '@/hooks/useInfinityFetchComments';
//! recoil
import { useRecoilValue } from 'recoil';
import { apiFetchState } from '@/store/apiFetchDataState';
//! component
import { ErrorFallback } from './components/ErrorFallback';
import { NoCommentFallback } from './components/NoCommentFallback';
import { CommentsExist } from './components/CommentsExist';
import { CommentsWrapper } from './components/CommentsWrapper';

type PropsType = {
  matchId: number;
};
export const Comments = (props: PropsType) => {
  const { matchId } = props;
  const {
    data: comments,
    refetch: refetchComments,
    isNextComments,
    // isError: isErrorFetchComments,
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
  // const isNewPostSuccess = useRecoilValue(
  //   apiFetchDataState({ dataName: 'comments/post', state: 'isSuccess' })
  // );

  const commentPostState = useRecoilValue(apiFetchState('comments/post'));
  const commentsFetchState = useRecoilValue(apiFetchState('comments/fetch'));

  useEffect(() => {
    if (commentPostState !== 'success') return;
    refetchNewComments();
  }, [commentPostState]);

  const isComments =
    (comments !== undefined && !!comments.length) ||
    (newComments !== undefined && !!newComments.length);

  const isNotComments =
    comments !== undefined && !comments.length && newComments !== undefined && !newComments.length;

  return (
    <CommentsWrapper>
      {commentsFetchState === 'error' && <ErrorFallback />}
      {/* {isErrorFetchComments && <ErrorFallback />} */}
      {isNotComments && <NoCommentFallback />}

      {isComments && (
        <CommentsExist
          comments={comments}
          newComments={newComments}
          isComments={isComments}
          isNextComments={isNextComments}
          isStale={isStale}
          fetchNextComments={refetchComments}
        />
      )}
    </CommentsWrapper>
  );
};
