import { useEffect } from 'react';
// import { useInView } from 'react-intersection-observer';
//! hooks
import { useFetchNewComments } from '@/hooks/apiHooks/comment';
//! recoil
import { useRecoilValue } from 'recoil';
import { apiFetchState, type ApiFetchStateType } from '@/store/apiFetchDataState';
//! types
import type { CommentType } from '@/types';
//! component
import { ErrorFallback } from './components/ErrorFallback';
import { NoCommentFallback } from './components/NoCommentFallback';
import { CommentsExist } from './components/CommentsExist';
import { CommentsWrapper } from './components/CommentsWrapper';

type PropsType = {
  matchId: number;
  comments: CommentType[] | undefined;
  refetchComments: () => void;
  isNextComments: boolean;
  commentFetchState: ApiFetchStateType;
};
export const Comments = (props: PropsType) => {
  const { matchId, comments, refetchComments, isNextComments, commentFetchState } = props;

  const {
    data: newComments,
    refetch,
    isStale,
  } = useFetchNewComments({
    matchId,
    resentPostTime: comments && !!comments.length ? comments[0].createdAt : null,
  });

  //? コメント投稿が成功したら新しいコメントをrefetchする
  // const isNewPostSuccess = useRecoilValue(
  //   apiFetchDataState({ dataName: 'comments/post', state: 'isSuccess' })
  // );

  const commentPostState = useRecoilValue(apiFetchState('comments/post'));

  useEffect(() => {
    if (commentPostState !== 'success') return;
    refetch();
  }, [commentPostState]);

  const isComments =
    (comments !== undefined && !!comments.length) ||
    (newComments !== undefined && !!newComments.length);

  const isNotComments =
    comments !== undefined && !comments.length && newComments !== undefined && !newComments.length;

  return (
    <CommentsWrapper>
      {commentFetchState === 'error' && <ErrorFallback />}
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
