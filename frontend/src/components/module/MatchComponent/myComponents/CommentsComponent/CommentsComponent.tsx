import React, { ReactNode } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { TAILWIND_BREAKPOINT } from '@/assets/tailwindcssBreakpoint';
//!icon
import { FaRegCommentDots } from 'react-icons/fa';
import { AiOutlineUser } from 'react-icons/ai';
//! hooks
import { useWindowSize } from '@/hooks/useWindowSize';
import { useFetchComments } from '@/hooks/apiHooks/useComment';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! type
import { CommentType } from '@/assets/types';

type CommentsSectionType = {
  paramsMatchID: number;
};

export const CommentsComponent = ({ paramsMatchID }: CommentsSectionType) => {
  //?コメントの取得
  const {
    data: commentsOfThisMatches,
    isLoading: isFetchingComments,
    isError: isErrorFetchComments,
  } = useFetchComments(paramsMatchID);

  //?コメント未取得状態
  const isCommentFirstFetching = commentsOfThisMatches === undefined;

  //?コメントの有無
  const isComments =
    commentsOfThisMatches && Boolean(commentsOfThisMatches.length);

  //! コメント未取得状態のDOM
  if (isCommentFirstFetching) return <CommentsComponentWrapper />;

  //!コメントの取得に失敗した場合のDOM
  if (isErrorFetchComments) {
    return (
      <CommentsComponentWrapper>
        <div className="w-full h-full flex justify-center items-center">
          <p className="relative">
            コメントの取得に失敗しました。お手数ですがページの更新を行ってください。
          </p>
        </div>
      </CommentsComponentWrapper>
    );
  }

  //! コメント投稿がない時のDOM
  if (!isComments && !isFetchingComments && !isErrorFetchComments) {
    return (
      <CommentsComponentWrapper>
        <div className="w-full h-full flex justify-center items-center">
          <p className="relative">
            コメント投稿はありません
            <FaRegCommentDots
              className={'absolute top-[-5px] right-[-22px] w-[20px] h-[20px]'}
            />
          </p>
        </div>
      </CommentsComponentWrapper>
    );
  }

  //! コメント投稿ありのDOM
  if (isComments) {
    return (
      <CommentsComponentWrapper>
        <ul>
          {commentsOfThisMatches.map((commentData) => (
            <li key={commentData.id}>
              <CommentBox commentData={commentData} />
            </li>
          ))}
        </ul>
      </CommentsComponentWrapper>
    );
  }
};

//! コメントbox
const CommentBox = ({ commentData }: { commentData: CommentType }) => {
  return (
    <div className={clsx('sm:p-5 p-3 pt-1 border-b-[1px] border-stone-200')}>
      <PostTimeAndUserName commentData={commentData} />
      <Comment commentData={commentData} />
    </div>
  );
};

const PostTimeAndUserName = ({ commentData }: { commentData: CommentType }) => {
  //? 投稿時間（投稿からの経過時間）
  const timeSincePost = dateFormatter(commentData.created_at);
  return (
    <div className="sm:flex mb-2">
      {/* //? post time */}
      <time className="text-xs text-stone-400 leading-6">{timeSincePost}</time>
      {/* //? post name */}
      <div className="flex sm:ml-3">
        {commentData.post_user_name ? (
          <>
            <AiOutlineUser className="mr-1 block bg-cyan-700/70 text-white mt-[2px] w-[16px] h-[16px] rounded-[50%]" />
            <p
              className={clsx(
                'text-stone-500',
                commentData.post_user_name.length > 20
                  ? 'text-[12px] sm:text-sm'
                  : 'text-sm'
              )}
            >
              {commentData.post_user_name}
            </p>
          </>
        ) : (
          <>
            <AiOutlineUser className="mr-1 block bg-stone-300 text-white mt-[2px] w-[16px] h-[16px] rounded-[50%]" />
            <p className="text-sm text-stone-600">ゲスト</p>
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
        (document.getElementById(`comment_${commentData.id}`)
          ?.clientHeight as number) > initialCommentElHeight()
          ? { height: '135px', overflow: 'hidden' }
          : { height: 'auto' }
      }
    >
      <p
        id={`comment_${commentData.id}`}
        className={clsx(
          'md:text-lg text-sm font-light sm:tracking-normal tracking-wider text-stone-800'
        )}
        dangerouslySetInnerHTML={{
          __html: commentData.comment,
        }}
      />
      {document.getElementById(`comment_${commentData.id}`) &&
        (document.getElementById(`comment_${commentData.id}`)
          ?.clientHeight as number) > initialCommentElHeight() && (
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

const stretchCommentElement = (
  event: React.MouseEvent<HTMLParagraphElement, MouseEvent>
) => {
  const handleClickElement = event.target as HTMLSpanElement;
  const parentElement = (
    handleClickElement.parentElement as HTMLParagraphElement
  ).parentElement as HTMLDivElement;

  (parentElement as HTMLDivElement).style.height = 'auto';
  if (handleClickElement) {
    (handleClickElement.parentElement as HTMLParagraphElement).style.display =
      'none';
  }
};

//! ラッパー
type CommentsComponentWrapperType = {
  children?: ReactNode;
};
//? Recoilから取得
const CommentsComponentWrapper = (props: CommentsComponentWrapperType) => {
  const commentPostTextareaHeight = useRecoilValue(
    elementSizeState('POST_COMMENT_HEIGHT')
  );

  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  const matchBoxerSectionHeight = useRecoilValue(
    elementSizeState('MATCH_PAGE_BOXER_SECTION_HEIGHT')
  );

  //? コンポーネントの高さを指定する為に除外する高さ
  const excludeHeight = (headerHeight ?? 0) + (matchBoxerSectionHeight ?? 0);

  const { children } = props;
  return (
    <section
      className="xl:w-[70%] w-full border-l-[1px] bg-white border-stone-200 relative"
      style={{
        paddingBottom: `${commentPostTextareaHeight}px`,
        minHeight: `calc(100vh - ${excludeHeight}px - 1px)`,
      }}
    >
      {children}
    </section>
  );
};
