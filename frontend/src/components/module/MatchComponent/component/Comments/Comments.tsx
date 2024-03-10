import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { TAILWIND_BREAKPOINT } from '@/assets/tailwindcssBreakpoint';
import { useInView } from 'react-intersection-observer';
//! hooks
import { useFetchComments } from '@/hooks/apiHooks/useComment';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useInfinityFetchComments } from '@/hooks/useInfinityFetchComments';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! type
import { CommentType } from '@/assets/types';
//!icon
import { MdErrorOutline } from 'react-icons/md';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { AiOutlineUser } from 'react-icons/ai';
import { RotatingLines } from 'react-loader-spinner';

type PropsType = {
  matchId: number;
};
export const Comments = (props: PropsType) => {
  const { matchId } = props;
  const {
    data: comments,
    refetch,
    isNextComments,
    isError: isErrorFetchComments,
  } = useInfinityFetchComments(matchId);
  // const {
  //   data: comments,
  //   isLoading: isFetchingComments,
  //   isError: isErrorFetchComments,
  // } = useFetchComments(matchId);
  const { inView, ref } = useInView();

  useEffect(() => {
    if (inView) {
      refetch();
    }
  }, [inView]);

  const isComments = comments !== undefined && comments.length;

  const isNotComments = comments !== undefined && !comments.length;

  //?エラー時
  if (isErrorFetchComments) return <ErrorFallback />;

  //? コメントがない時
  if (isNotComments) return <NoCommentFallback />;

  return (
    <CommentsWrapper>
      {isComments && (
        <div className="sm:w-[80%] w-[92%] max-w-[750px] mt-3">
          {comments?.map((comment) => (
            <div key={comment.id} className="pb-3">
              <CommentBox comment={comment} />
            </div>
          ))}
          {isNextComments && (
            <div ref={ref} className="pb-3">
              <CommentsLoadingEl />
            </div>
          )}
        </div>
      )}
    </CommentsWrapper>
  );
};

//! コメントbox
const CommentBox = ({ comment }: { comment: CommentType }) => {
  return (
    <div
      className={clsx(
        'sm:p-5 p-3 pt-1 text-stone-200 sm:text-base text-sm bg-neutral-800/50 rounded-lg'
      )}
    >
      <PostTimeAndUserName commentData={comment} />
      <Comment commentData={comment} />
    </div>
  );
};

const PostTimeAndUserName = ({ commentData }: { commentData: CommentType }) => {
  //? 投稿時間（投稿からの経過時間）
  const timeSincePost = dateFormatter(commentData.createdAt);
  return (
    <div className="flex items-center mb-2">
      {/* //? post time */}
      <time className="text-xs text-stone-500 leading-6">{timeSincePost}</time>
      {/* //? post name */}
      <div className="ml-3">
        {commentData.postUserName ? (
          <>
            <p
              className={clsx(
                'flex',
                commentData.postUserName.length > 20 ? 'text-[12px] sm:text-sm' : 'text-sm'
              )}
            >
              <AiOutlineUser className="mr-1 block bg-cyan-700/70 text-white mt-[2px] w-[16px] h-[16px] rounded-[50%]" />
              {commentData.postUserName}
            </p>
          </>
        ) : (
          <>
            <p className="flex text-sm text-stone-600">
              <AiOutlineUser className="mr-1 block bg-stone-300 text-white mt-[2px] w-[16px] h-[16px] rounded-[50%]" />
              ゲスト
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const Comment = ({ commentData }: { commentData: CommentType }) => {
  const { windowSize } = useWindowSize();
  //? ひとつのコメントのmin height
  const initialCommentElHeight = () => {
    if (!windowSize) return 0;
    if (windowSize > TAILWIND_BREAKPOINT.sm) return 200;
    if (windowSize < TAILWIND_BREAKPOINT.sm) return 100;
    return 0;
  };
  return (
    <div
      className="relative"
      style={
        document.getElementById(`comment_${commentData.id}`) &&
        (document.getElementById(`comment_${commentData.id}`)?.clientHeight as number) >
          initialCommentElHeight()
          ? { height: '135px', overflow: 'hidden' }
          : { height: 'auto' }
      }
    >
      <p
        id={`comment_${commentData.id}`}
        className={clsx('text-neutral-300')}
        dangerouslySetInnerHTML={{
          __html: commentData.comment,
        }}
      />
      {document.getElementById(`comment_${commentData.id}`) &&
        (document.getElementById(`comment_${commentData.id}`)?.clientHeight as number) >
          initialCommentElHeight() && (
          <p className="absolute bottom-0 left-0 md:h-[25px] h-[35px] bg-white w-full">
            <span
              onClick={stretchCommentElement}
              className={clsx(
                'text-stone-500 cursor-pointer border-[1px] border-transparent text-sm absolute box-border bottom-0',
                'hover:border-b-stone-800 hover:text-stone-800'
              )}
            >
              続きを読む
            </span>
          </p>
        )}
    </div>
  );
};

const dateFormatter = (postDate: string): string => {
  const todayRaw = dayjs();
  const targetRaw = dayjs(postDate);
  //? 1分以内かどうか
  const secondsDiff = todayRaw.diff(targetRaw, 'second');
  if (secondsDiff < 60) return `今`;
  //? 何分前か
  const minutesDiff = todayRaw.diff(targetRaw, 'minute');
  if (minutesDiff < 60) return `${minutesDiff}分前`;
  //? 何時間前か
  const hoursDiff = todayRaw.diff(targetRaw, 'hour');
  if (hoursDiff < 24) return `${hoursDiff}時間前`;

  const today = dayjs().startOf('day');
  const targetDate = dayjs(postDate).startOf('day');

  const differenceInDays = today.diff(targetDate, 'day');

  if (differenceInDays === 1) return `1日前`;
  if (differenceInDays === 2) return `2日前`;
  if (differenceInDays === 3) return `3日前`;
  if (differenceInDays === 4) return `4日前`;
  if (differenceInDays === 5) return `5日前`;
  if (differenceInDays === 6) return `6日前`;
  const monthDiff = today.diff(targetDate, 'month');
  if (monthDiff === 0) {
    const weekDiff = today.diff(targetDate, 'week');
    return `${weekDiff}週間前`;
  } else if (monthDiff < 12) {
    return `${monthDiff}ヵ月前`;
  } else {
    const yearDiff = today.diff(targetDate, 'year');
    return `${yearDiff}年前`;
  }
};

const stretchCommentElement = (event: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => {
  const handleClickElement = event.target as HTMLSpanElement;
  const parentElement = (handleClickElement.parentElement as HTMLParagraphElement)
    .parentElement as HTMLDivElement;

  (parentElement as HTMLDivElement).style.height = 'auto';
  if (handleClickElement) {
    (handleClickElement.parentElement as HTMLParagraphElement).style.display = 'none';
  }
};

type CommentsWrapperType = {
  children?: React.ReactNode;
};
const CommentsWrapper = (props: CommentsWrapperType) => {
  const el = useRef<HTMLDivElement>(null);
  const postCommentElHeight = useRecoilValue(elementSizeState('POST_COMMENT_HEIGHT'));
  const headerElHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  const { device } = useWindowSize();

  const scrollToTop = () => {
    if (el.current) {
      el.current.style.scrollBehavior = 'smooth';
      el.current.scrollTop = 0;
    }
  };

  const { children } = props;
  return (
    <>
      <div
        ref={el}
        className={clsx(
          'relative w-full flex justify-center',
          device === 'PC' ? 'my-scroll-y' : 'overflow-auto'
        )}
        style={{
          paddingTop: `${headerElHeight}px`,
          height: `calc(100vh - (${postCommentElHeight}px) - 1px)`,
        }}
      >
        {children}
      </div>
    </>
  );
};

//!コメントなしのcomponent
const NoCommentFallback = () => {
  return (
    <CommentsWrapper>
      <div className="w-full flex justify-center items-center">
        <div className="">
          <div className="w-full flex justify-center">
            <div className="relative w-[60px] h-[60px] border-[5px] rounded-[50%] border-neutral-200/30">
              <span className="text-neutral-200/30 text-[30px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
                <FaRegPenToSquare />
              </span>
            </div>
          </div>

          <p className="mt-3 text-neutral-200/80">まだコメントはありません</p>
        </div>
      </div>
    </CommentsWrapper>
  );
};

//!エラー時のcomponent
const ErrorFallback = () => {
  return (
    <CommentsWrapper>
      <div className="w-full flex justify-center items-center">
        <div className="">
          <div className="w-full flex justify-center">
            <span className="text-neutral-200/60 text-[70px]">
              <MdErrorOutline />
            </span>
          </div>

          <p className="mt-3 text-neutral-200/80">コメントの取得に失敗しました！</p>
        </div>
      </div>
    </CommentsWrapper>
  );
};

const CommentsLoadingEl = () => {
  return (
    <div
      className={clsx(
        'flex justify-center items-center sm:p-5 p-3 pt-1 text-stone-200 sm:text-base text-sm bg-neutral-800/50 rounded-lg'
      )}
    >
      <RotatingLines strokeColor="#ffffff" strokeWidth="3" animationDuration="1" width="30" />
    </div>
  );
};
