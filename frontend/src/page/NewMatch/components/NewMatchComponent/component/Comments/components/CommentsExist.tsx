import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useInView } from 'react-intersection-observer';
//! type
import { CommentType } from '@/assets/types';
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
    <motion.div
      className={clsx(
        'sm:p-5 p-3 pt-1 text-stone-200 sm:text-base text-sm bg-neutral-800/50 rounded-lg'
      )}
    >
      <PostTimeAndUserName commentData={comment} />
      <Comment commentData={comment} />
    </motion.div>
  );
};

const Comment = ({ commentData }: { commentData: CommentType }) => {
  const commentRef = useRef<HTMLParagraphElement>(null);
  //? ひとつのコメントのmin height

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const readMore = () => {
    setIsExpanded(true);
  };

  useEffect(() => {
    if (commentRef.current) {
      const { scrollHeight, clientHeight } = commentRef.current;
      setIsOverflowing(scrollHeight > clientHeight);
    }
  }, [commentData.comment]);

  return (
    <div className="relative">
      <motion.p
        ref={commentRef}
        transition={{ duration: 0.2 }}
        className={clsx(
          'text-neutral-300 duration-300 overflow-hidden',
          isExpanded ? 'line-clamp-none' : 'line-clamp-4'
        )}
        dangerouslySetInnerHTML={{
          __html: commentData.comment,
        }}
      />
      {isOverflowing && !isExpanded && (
        <button onClick={readMore} className="text-blue-500 hover:underline mt-2">
          続きを読む
          {/* {isExpanded ? '閉じる' : '続きを読む'} */}
        </button>
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