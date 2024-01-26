import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { TAILWIND_BREAKPOINT } from '@/assets/tailwindcssBreakpoint';
//!icon
import { LiaCommentDotsSolid } from 'react-icons/lia';
import { AiOutlineUser } from 'react-icons/ai';
//! hooks
import { useWindowSize } from '@/hooks/useWindowSize';
import { useFetchComments } from '@/hooks/apiHooks/useComment';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';

type CommentsSectionType = {
  paramsMatchID: number;
  // commentPostTextareaHeight: number | undefined;
};

export const CommentsComponent = ({
  paramsMatchID,
}: // commentPostTextareaHeight,
CommentsSectionType) => {
  // ? use hook
  const { windowSize } = useWindowSize();
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const matchBoxerSectionHeight = useRecoilValue(
    elementSizeState('MATCH_PAGE_BOXER_SECTION_HEIGHT')
  );
  const {
    data: commentsOfThisMatches,
    isLoading: isFetchingComments,
    isError: isErrorFetchComments,
  } = useFetchComments(paramsMatchID);

  const commentPostTextareaHeight = useRecoilValue(
    elementSizeState('POST_COMMENT_HEIGHT')
  );

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
    // const hourTime = dayjs(postDate).format('H:mm');

    const differenceInDays = today.diff(targetDate, 'day');

    // if (differenceInDays === 0) return `今日 ${hourTime}`;
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
    // return dayjs(postDate).format('YYYY年M月D日 H:mm');
  };

  const [liElements, setLiElements] = React.useState<Element[]>();
  const ulRef = useRef(null);
  useEffect(() => {
    if (!ulRef.current) return;
    const childElements = (ulRef.current as HTMLUListElement).children;
    const childArray = Array.from(childElements);
    setLiElements(childArray);
  }, [ulRef.current, commentsOfThisMatches]);

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

  const initialCommentElHeight = () => {
    if (!windowSize) return 0;
    if (windowSize > TAILWIND_BREAKPOINT.sm) return 200;
    if (windowSize < TAILWIND_BREAKPOINT.sm) return 100;
    return 0;
  };

  //コメントの有無
  const isComments =
    commentsOfThisMatches && Boolean(commentsOfThisMatches.length);

  //コメントの取得に失敗
  if (isErrorFetchComments) {
    return (
      <section>
        コメントの取得に失敗しました。お手数ですがページの更新を行ってください。
      </section>
    );
  }

  //コメント投稿がない場合
  if (!isComments && !isFetchingComments && !isErrorFetchComments) {
    return NotExistsComments({
      headerHeight,
      matchBoxerSectionHeight,
      commentPostTextareaHeight,
    });
  }

  // コメント投稿あり
  return (
    isComments && (
      <section
        className="xl:w-[70%] w-full border-l-[1px] border-stone-200 relative"
        style={{
          marginBottom: `${commentPostTextareaHeight}px`,
          minHeight: `calc(100vh - (${headerHeight}px + ${matchBoxerSectionHeight}px + ${commentPostTextareaHeight}px) - 1px)`,
        }}
      >
        {!liElements && (
          <div className="z-10 absolute top-0 left-0 w-full h-full bg-white" />
        )}
        <ul ref={ulRef}>
          {commentsOfThisMatches.map((commentData) => (
            <li
              key={commentData.id}
              className={clsx(
                'sm:p-5 p-3 pt-1 border-b-[1px] border-stone-200'
              )}
            >
              <div className="sm:flex mb-2">
                <time className="text-xs text-stone-400 leading-6">
                  {dateFormatter(commentData.created_at)}
                </time>
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
                      <p className="text-sm text-stone-600">ゲスト投稿</p>
                    </>
                  )}
                </div>
              </div>
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

              {/* //? ゴミ箱 */}
              {/* {authUser && authUser.name === commentData.post_user_name && (
                  <button
                    onClick={() => commentDelete(commentData.id)}
                    className="bg-blue-300 px-3 py-1"
                  >
                    ゴミ箱
                  </button>
                )} */}
            </li>
          ))}
        </ul>
      </section>
    )
  );
};

type NotExistsCommentsPropsType = {
  headerHeight: number | undefined;
  matchBoxerSectionHeight: number | undefined;
  commentPostTextareaHeight: number | undefined;
};
//コメント投稿なし時の表示コンポーネント
const NotExistsComments = ({
  headerHeight,
  matchBoxerSectionHeight,
  commentPostTextareaHeight,
}: NotExistsCommentsPropsType) => {
  return (
    <section
      className="flex justify-center text-[18px] border-l-[1px] xl:w-[70%] w-full"
      style={{
        minHeight: `calc(100vh - (${headerHeight}px + ${matchBoxerSectionHeight}px + ${commentPostTextareaHeight}px) - 1px)`,
      }}
    >
      <div className="relative mt-12">
        <p>コメント投稿はありません</p>
        <LiaCommentDotsSolid
          className={'absolute top-[-15px] right-[-30px] w-[30px] h-[30px]'}
        />
      </div>
    </section>
  );
};
