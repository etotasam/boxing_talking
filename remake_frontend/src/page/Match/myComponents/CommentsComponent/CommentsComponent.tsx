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
                {dayjs(commentData.created_at).format('YYYY/MM/DD HH:mm')}
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
