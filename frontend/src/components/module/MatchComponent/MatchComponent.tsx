import React from 'react';
import clsx from 'clsx';
import { RotatingLines } from 'react-loader-spinner';
//! icon
import { BiSend } from 'react-icons/bi';
//! types
import { MatchDataType } from '@/assets/types';
//! component
import { BoxerInfoModal } from '@/components/modal/BoxerInfoModal';
import { MatchInfoModal } from '@/components/modal/MatchInfoModal';
import { LeftSection } from './myComponents/LeftSection';
import { CommentsComponent } from './myComponents/CommentsComponent';
import { PredictionVoteModal } from '@/components/modal/PredictionVoteModal';
import { Boxers } from './myComponents/Boxers';
//! hooks
import { usePostComment } from '@/hooks/apiHooks/useComment';

type PropsType = {
  isPredictionVoteModal: boolean;
  isBoxerInfoModal: boolean;
  isShowMatchInfoModal: boolean;
  paramsMatchID: number;
  thisMatch: MatchDataType | undefined;
  device: 'PC' | 'SP' | undefined;
  commentPostRef: React.MutableRefObject<null>;
  textareaRef: React.MutableRefObject<null>;
  setComment: React.Dispatch<React.SetStateAction<string | undefined>>;
  storeCommentExecute: () => void;
  autoExpandTextareaAndSetComment: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

export const MatchComponent = (props: PropsType) => {
  const {
    device,
    thisMatch,
    isBoxerInfoModal,
    isPredictionVoteModal,
    isShowMatchInfoModal,
  } = props;
  return (
    <>
      {/* //? Boxer */}
      <Boxers thisMatch={thisMatch} />

      <div className="flex w-full">
        {/* //? Left section (Match info) */}
        {device === 'PC' && (
          <LeftSection
            thisMatch={thisMatch}
            commentPostEl={props.commentPostRef.current}
          />
        )}
        {/* //? Comments */}
        <CommentsComponent paramsMatchID={props.paramsMatchID} />
      </div>

      <section
        ref={props.commentPostRef}
        className="z-10 fixed bottom-0 w-full flex bg-white/60 justify-center py-8 border-t-[1px] border-stone-200"
      >
        <div className="md:w-[70%] sm:w-[85%] sm:max-w-[800px] w-[95%]">
          <PostCommentTextarea
            setComment={props.setComment}
            storeCommentExecute={props.storeCommentExecute}
            textareaRef={props.textareaRef}
            autoExpandTextareaAndSetComment={
              props.autoExpandTextareaAndSetComment
            }
          />
        </div>
      </section>

      {isBoxerInfoModal && device === 'SP' && (
        //? BoxerInfoモーダル
        <BoxerInfoModal />
      )}

      {thisMatch && isShowMatchInfoModal && device === 'SP' && (
        <MatchInfoModal matchData={thisMatch} />
      )}

      {thisMatch && isPredictionVoteModal && (
        //? 投票モーダル
        <PredictionVoteModal thisMatch={thisMatch} />
      )}
    </>
  );
};

// ! post comment textarea
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
