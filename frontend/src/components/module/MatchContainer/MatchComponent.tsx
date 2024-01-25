import React from 'react';
import { RotatingLines } from 'react-loader-spinner';
//! icon
import { BiSend } from 'react-icons/bi';
//! types
import { MatchDataType } from '@/assets/types';
//! component
import { LeftSection } from './myComponents/LeftSection';
import { CommentsComponent } from './myComponents/CommentsComponent';
import { SetUpBoxers } from './myComponents/SetUpBoxers';
import clsx from 'clsx';

type PropsType = {
  paramsMatchID: number;
  thisMatchPredictionOfUsers: 'red' | 'blue' | 'No prediction vote' | undefined;
  thisMatch: MatchDataType | undefined;
  thisMatchPredictionCount: Record<
    'redCount' | 'blueCount' | 'totalCount',
    number
  >;
  isFetchingComments: boolean;
  isThisMatchAfterToday: boolean | undefined;
  device: 'PC' | 'SP' | undefined;
  headerHeight: number | undefined;
  commentPostRef: React.MutableRefObject<null>;
  textareaRef: React.MutableRefObject<null>;
  isPostingComment: boolean;
  setComment: React.Dispatch<React.SetStateAction<string | undefined>>;
  storeCommentExecute: () => void;
  autoExpandTextareaAndSetComment: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

export const MatchComponent = (props: PropsType) => {
  return (
    <>
      {/* //? Boxer */}
      <SetUpBoxers
        paramsMatchID={props.paramsMatchID}
        thisMatchPredictionOfUsers={props.thisMatchPredictionOfUsers}
        thisMatch={props.thisMatch}
        thisMatchPredictionCount={props.thisMatchPredictionCount}
        isFetchingComments={props.isFetchingComments}
        isThisMatchAfterToday={props.isThisMatchAfterToday}
      />
      <div className="flex w-full]">
        {/* //? Left section (Match info) */}
        {props.device === 'PC' && (
          <LeftSection
            thisMatch={props.thisMatch}
            thisMatchPredictionOfUsers={props.thisMatchPredictionOfUsers}
            isThisMatchAfterToday={props.isThisMatchAfterToday}
            headerHeight={props.headerHeight}
            commentPostEl={props.commentPostRef.current}
          />
        )}
        {/* //? Comments */}
        <CommentsComponent paramsMatchID={props.paramsMatchID} />
      </div>

      <section
        ref={props.commentPostRef}
        className="fixed bottom-0 w-full flex bg-white/60 justify-center py-8 border-t-[1px] border-stone-200"
      >
        <div className="md:w-[70%] sm:w-[85%] sm:max-w-[800px] w-[95%]">
          <PostCommentTextarea
            isPostingComment={props.isPostingComment}
            setComment={props.setComment}
            storeCommentExecute={props.storeCommentExecute}
            textareaRef={props.textareaRef}
            autoExpandTextareaAndSetComment={
              props.autoExpandTextareaAndSetComment
            }
          />
        </div>
      </section>
    </>
  );
};

// ! post comment textarea
type PostCommentTextareaType = {
  isPostingComment: boolean;
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
  isPostingComment,
}: PostCommentTextareaType) => {
  return (
    <div className="border-stone-400 bg-white relative border-[1px] sm:pl-3 sm:py-2 pl-2 py-1 rounded-sm flex justify-center items-center">
      <textarea
        ref={textareaRef}
        className="w-full resize-none outline-0 leading-[28px] pr-[100px] bg-white"
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
          'absolute bottom-[5px] sm:bottom-[7px] sm:w-[50px] sm:h-[30px] w-[45px] h-[25px] text-[14px] right-[10px] border-[1px] bg-stone-600 hover:bg-cyan-800 focus:bg-cyan-800 rounded-sm duration-300 py-1 text-white text-xl flex justify-center items-center',
          isPostingComment && 'text-white/50 select-none'
        )}
      >
        {isPostingComment ? (
          <span className="sm:w-[20px] sm:h-[20px] w-[15px] h-[15px]">
            <RotatingLines width="100%" strokeColor="white" />
          </span>
        ) : (
          <BiSend />
        )}
      </button>
    </div>
  );
};
