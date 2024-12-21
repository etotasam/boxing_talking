import { useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { TAILWIND_BREAKPOINT } from '@/assets/tailwindcssBreakpoint';
import { useInView } from 'react-intersection-observer';
//! recoil
import { useRecoilValue } from 'recoil';
import { boolState } from '@/store/boolState';
//! type
import { CommentType } from '@/assets/types';
//! hook
import { useWindowSize } from '@/hooks/useWindowSize';
//! icon
import { AiOutlineUser } from 'react-icons/ai';
import { RotatingLines } from 'react-loader-spinner';
// wrapper
import { CommentsWrapper } from './CommentsWrapper';

type CommentsExistType = {
  newComments: CommentType[] | undefined;
  comments: CommentType[] | undefined;
  isComments: boolean;
  isStale: boolean;
  isNextComments: boolean;
  fetchNextComments: () => void;
};
export const CommentsExist = (props: CommentsExistType) => {
  const { isComments, newComments, comments, isStale, isNextComments, fetchNextComments } = props;
  const { inView, ref } = useInView();

  useEffect(() => {
    if (!inView) return;
    fetchNextComments();
  }, [inView]);

  return (
    <CommentsWrapper>
      {isComments && (
        <div className="md:w-[85%] sm:w-[85%] w-[95%] max-w-[800px]">
          {newComments?.map((comment) => (
            <motion.div
              layout
              initial={{ opacity: isStale ? 1 : 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: isStale ? 0 : 0.4 } }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.7, 1] }}
              key={comment.id}
              className="mt-3 last:pb-7"
            >
              <CommentBox comment={comment} />
            </motion.div>
          ))}
          {comments?.map((comment) => (
            <motion.div
              layout
              animate={{ y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.7, 1] }}
              key={comment.id}
              className="mt-3 last:pb-7"
            >
              <CommentBox comment={comment} />
            </motion.div>
          ))}
          {isNextComments && (
            <div ref={ref} className="mt-3">
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

const Comment = ({ commentData }: { commentData: CommentType }) => {
  const { windowSize } = useWindowSize();
  //? ひとつのコメントのmin height
  const defaultCommentElHeight = windowSize ? (windowSize > TAILWIND_BREAKPOINT.sm ? 200 : 100) : 0;

  const el = document.getElementById(`comment_${commentData.id}`);
  const elHeight = el ? el.clientHeight : 0;
  return (
    <div
      className="relative"
      style={
        elHeight > defaultCommentElHeight
          ? { height: `auto`, overflow: 'hidden' }
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
      {elHeight > defaultCommentElHeight && (
        <p className="md:h-[25px] h-[35px] bg-white w-full">
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

//? 長いコメントの表示をコントロール
const stretchCommentElement = (event: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => {
  const handleClickElement = event.target as HTMLSpanElement;
  const parentElement = (handleClickElement.parentElement as HTMLParagraphElement)
    .parentElement as HTMLDivElement;

  (parentElement as HTMLDivElement).style.height = 'auto';
  if (handleClickElement) {
    (handleClickElement.parentElement as HTMLParagraphElement).style.display = 'none';
  }
};
