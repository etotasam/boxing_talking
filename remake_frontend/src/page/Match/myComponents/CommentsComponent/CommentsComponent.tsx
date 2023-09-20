import clsx from 'clsx';
import dayjs from 'dayjs';
//!icon
import { LiaCommentDotsSolid } from 'react-icons/lia';
import { AiOutlineUser } from 'react-icons/ai';
//! hooks
import { useFetchComments } from '@/hooks/useComment';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import { useMatchBoxerSectionHeight } from '@/hooks/useMatchBoxerSectionHeight';

type CommentsSectionType = {
  paramsMatchID: number;
  commentPostTextareaHeight: number | undefined;
};

export const CommentsComponent = ({
  paramsMatchID,
  commentPostTextareaHeight,
}: CommentsSectionType) => {
  // ? use hook
  const { state: headerHeight } = useHeaderHeight();
  const { state: matchBoxerSectionHeight } = useMatchBoxerSectionHeight();
  const {
    data: commentsOfThisMatches,
    isLoading: isFetchingComments,
    isError: isErrorFetchComments,
  } = useFetchComments(paramsMatchID);

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

  return commentsOfThisMatches && Boolean(commentsOfThisMatches.length) ? (
    <section
      className="xl:w-[70%] md:w-[60%] w-full border-l-[1px] border-stone-200"
      style={{
        marginBottom: `${commentPostTextareaHeight}px`,
        minHeight: `calc(100vh - (${headerHeight}px + ${matchBoxerSectionHeight}px + ${commentPostTextareaHeight}px) - 1px)`,
      }}
    >
      <ul>
        {commentsOfThisMatches.map((commentData) => (
          <li
            key={commentData.id}
            className={clsx('p-5 pb-1 border-b-[1px] border-stone-200')}
          >
            <p
              className="text-lg font-light text-stone-600"
              dangerouslySetInnerHTML={{
                __html: commentData.comment,
              }}
            />
            <div className="sm:flex mt-3">
              <time className="text-xs text-stone-400 leading-6">
                {dateFormatter(commentData.created_at)}
              </time>
              <div className="flex sm:ml-3">
                {commentData.post_user_name ? (
                  <>
                    <AiOutlineUser className="mr-1 block bg-cyan-700/70 text-white mt-[2px] w-[16px] h-[16px] rounded-[50%]" />
                    <p className="text-sm text-stone-500">
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
  ) : !isFetchingComments && !isErrorFetchComments ? (
    <section
      className="flex justify-center items-center text-[18px] border-l-[1px] xl:w-[70%] md:w-[60%] w-full"
      style={{
        minHeight: `calc(100vh - (${headerHeight}px + ${matchBoxerSectionHeight}px + ${commentPostTextareaHeight}px) - 1px)`,
      }}
    >
      <div className="relative">
        <p>まだコメントがありません</p>
        <LiaCommentDotsSolid
          className={'absolute top-[-15px] right-[-30px] w-[30px] h-[30px]'}
        />
      </div>
    </section>
  ) : (
    isErrorFetchComments && (
      <section>
        コメントの取得に失敗しました。お手数ですがページの更新を行ってください。
      </section>
    )
  );
};
