import React from 'react';
import clsx from 'clsx';
//!icon
import { RotatingLines } from 'react-loader-spinner';
import { FaRegCommentDots } from 'react-icons/fa';
//! hooks
import { usePostComment } from '@/hooks/apiHooks/useComment';

type PostCommentType = {
  commentPostRef: React.MutableRefObject<null>;
  setComment: React.Dispatch<React.SetStateAction<string | undefined>>;
  storeCommentExecute: () => void;
  textareaRef: React.MutableRefObject<null>;
  autoExpandTextareaAndSetComment: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};
export const PostComment = (props: PostCommentType) => {
  const {
    commentPostRef,
    setComment,
    storeCommentExecute,
    textareaRef,
    autoExpandTextareaAndSetComment,
  } = props;
  return (
    <div ref={commentPostRef} className="w-full flex justify-center pb-5">
      <div className="md:w-[85%] sm:w-[85%] w-[95%] max-w-[800px]">
        <PostCommentTextarea
          setComment={setComment}
          storeCommentExecute={storeCommentExecute}
          textareaRef={textareaRef}
          autoExpandTextareaAndSetComment={autoExpandTextareaAndSetComment}
        />
      </div>
    </div>
  );
};

// ! コメント投稿テキストエリア
type PostCommentTextareaType = {
  setComment: React.Dispatch<React.SetStateAction<string | undefined>>;
  storeCommentExecute: () => void;
  textareaRef: React.MutableRefObject<null>;
  autoExpandTextareaAndSetComment: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

const PostCommentTextarea = ({
  storeCommentExecute,
  textareaRef,
  autoExpandTextareaAndSetComment,
}: PostCommentTextareaType) => {
  //? コメント投稿中…の状態取得(hookの中でRecoilを使用)
  const { isLoading: isPostingComment } = usePostComment();
  return (
    <div className="border-neutral-600 bg-neutral-800 text-neutral-200 relative border-[1px] pr-[60px] sm:pl-5 sm:py-2 pl-2 py-1 rounded-xl flex justify-center items-center">
      <textarea
        ref={textareaRef}
        className="w-full resize-none outline-0 placeholder:text-stone-600 leading-[34px] bg-neutral-800"
        placeholder="コメント投稿..."
        wrap={'hard'}
        name=""
        id=""
        rows={1}
        onChange={autoExpandTextareaAndSetComment}
      ></textarea>
      <button
        onClick={storeCommentExecute}
        className={clsx(
          'absolute bottom-[5px] right-[15px] sm:bottom-[4px] sm:w-[40px] sm:h-[40px] w-[35px] h-[35px] text-[14px] border-[1px] border-neutral-500 bg-neutral-700 hover:bg-cyan-800 focus:bg-cyan-800 rounded-md duration-300 py-1 text-stone-300 text-xl flex justify-center items-center',
          isPostingComment && 'text-white/50 select-none'
        )}
      >
        {isPostingComment ? (
          <span className="sm:w-[20px] sm:h-[20px] w-[15px] h-[15px]">
            <RotatingLines width="100%" strokeColor="white" />
          </span>
        ) : (
          <FaRegCommentDots />
        )}
      </button>
    </div>
  );
};
