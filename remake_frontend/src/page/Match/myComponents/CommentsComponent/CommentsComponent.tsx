import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import dayjs from 'dayjs';
//! hooks
import { useFetchComments } from '@/hooks/useComment';

type CommentsSectionType = {
  paramsMatchID: number;
  commentPostComponentHeight: number | undefined;
  excludeHeight: number | undefined;
};

export const CommentsComponent = ({
  paramsMatchID,
  commentPostComponentHeight,
  excludeHeight,
}: CommentsSectionType) => {
  const {
    data: commentsOfThisMatches,
    isLoading: isFetchingComments,
    isError: isErrorFetchComments,
  } = useFetchComments(paramsMatchID);

  const dateFormatter = (postDate: string): string => {
    const today = dayjs().startOf('day');
    const targetDate = dayjs(postDate).startOf('day');
    const hourTime = dayjs(postDate).format('H:mm');

    const differenceInDays = today.diff(targetDate, 'day');

    if (differenceInDays === 0) return `今日 ${hourTime}`;
    if (differenceInDays === 1) return `1日前 ${hourTime}`;
    if (differenceInDays === 2) return `2日前 ${hourTime}`;
    if (differenceInDays === 3) return `3日前 ${hourTime}`;
    if (differenceInDays === 4) return `4日前 ${hourTime}`;
    if (differenceInDays === 5) return `5日前 ${hourTime}`;
    if (differenceInDays === 6) return `6日前 ${hourTime}`;
    if (differenceInDays === 7) return `1週間前 ${hourTime}`;

    return dayjs(postDate).format('YYYY/M/D H:mm');
  };

  return commentsOfThisMatches && Boolean(commentsOfThisMatches.length) ? (
    <section
      className="w-[70%] border-l-[1px] border-stone-200"
      style={{
        marginBottom: `${commentPostComponentHeight}px`,
        minHeight: `calc(100vh - (${excludeHeight}px + ${commentPostComponentHeight}px) - 1px)`,
      }}
    >
      <AnimatePresence>
        {commentsOfThisMatches.map((commentData) => (
          <motion.div
            // layout
            // exit={{ opacity: 0 }}
            // initial={{ opacity: 0 }}
            // animate={{ opacity: 1 }}
            // transition={{ duration: 0.2 }}
            key={commentData.id}
            className={clsx('p-5 border-b-[1px] border-stone-200')}
          >
            <p
              className="text-[20px] font-light text-stone-800"
              dangerouslySetInnerHTML={{
                __html: commentData.comment,
              }}
            />
            <div className="flex mt-3">
              <time className="text-sm text-stone-400">
                {dateFormatter(commentData.created_at)}
              </time>
              <p className="text-sm ml-3 text-stone-600">
                {commentData.post_user_name}
              </p>
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
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  ) : !isFetchingComments && !isErrorFetchComments ? (
    <section
      className="flex justify-center items-center text-[18px] border-l-[1px] w-[70%]"
      style={{
        // marginBottom: `${commentPostComponentHeight}px`,
        minHeight: `calc(100vh - (${excludeHeight}px + ${commentPostComponentHeight}px) - 1px)`,
      }}
    >
      <p>まだコメントがありません…</p>
    </section>
  ) : (
    isErrorFetchComments && (
      <section>
        コメントの取得に失敗しました。お手数ですがページの更新を行ってください。
      </section>
    )
  );
};
