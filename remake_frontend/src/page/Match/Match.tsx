import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

//! types
import { MatchesDataType } from '@/assets/types';
// ! hook
import { useAuth } from '@/hooks/useAuth';
import { useToastModal } from '@/hooks/useToastModal';
import { useLoading } from '@/hooks/useLoading';
import { useFetchMatches } from '@/hooks/useMatch';
import { usePagePath } from '@/hooks/usePagePath';
import {
  useVoteMatchPrediction,
  useFetchMatchPredictVote,
} from '@/hooks/uesWinLossPredition';
import { usePostComment, useFetchComments } from '@/hooks/useComment';
//! component
import { LeftSection } from './myComponents/LeftSection';
import { CommentsComponent } from './myComponents/CommentsComponent';
import { SetUpBoxers } from './myComponents/SetUpBoxers';
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from '@/assets/statusesOnToastModal';

export const Match = () => {
  // ? use hook
  const { pathname, search } = useLocation();
  const query = new URLSearchParams(search);
  const paramsMatchID = Number(query.get('match_id'));
  const { data: matches } = useFetchMatches();
  const { matchPrediction, isSuccess: isSuccessVoteMatchPrediction } =
    useVoteMatchPrediction();
  const { data: allPredictionVoteOfUsers, refetch: refetchAllPredictionData } =
    useFetchMatchPredictVote();
  const { setToastModal, showToastModal } = useToastModal();
  const { startLoading, resetLoadingState } = useLoading();
  const { isLoading: isFetchingComments } = useFetchComments(paramsMatchID);

  const { setter: setPagePath } = usePagePath();
  const { data: authUser } = useAuth();

  const { postComment, isSuccess: isSuccessPostComment } = usePostComment();
  //? useState
  const [comment, setComment] = useState<string>();
  const [commentPostTextareaHeight, setCommentPostComponentHeight] =
    useState<number>();
  const [thisMatch, setThisMatch] = useState<MatchesDataType>();
  const [thisMatchPredictionCount, setThisMatchPredictionCount] = useState<
    Record<'redCount' | 'blueCount' | 'totalCount', number>
  >({ redCount: 0, blueCount: 0, totalCount: 0 });
  const [boxerSectionElHeight, setBoxerSectionRef] = useState<
    number | undefined
  >();

  //? set data of this match(この試合の各データをuseState等にセット)
  useEffect(() => {
    if (!matches || !paramsMatchID) return;
    const match = matches?.find((match) => match.id === paramsMatchID);
    if (!match) return;
    setThisMatch(match);
    setThisMatchPredictionCount({
      redCount: match.count_red,
      blueCount: match.count_blue,
      totalCount: match.count_red + match.count_blue,
    });
  }, [paramsMatchID, matches]);

  const [thisMatchPredictionOfUsers, setThisMatchPredictionOfUsers] = useState<
    'red' | 'blue' | 'No prediction vote' | undefined
  >();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //? useRef
  const commentPostRef = useRef(null);
  const textareaRef = useRef(null);

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    //? ページpathをRecoilに保存
    setPagePath(pathname);
    return () => {
      resetLoadingState();
    };
  }, []);

  //? この試合の勝敗予想の有無とその投票
  useEffect(() => {
    //? 投票データの取得が完了しているかどうか。ログインしていない場合このデータは取得しない設定にしてる
    if (allPredictionVoteOfUsers !== undefined) {
      const thisMatchPredictionVote = allPredictionVoteOfUsers.find(
        (data) => data.match_id === Number(paramsMatchID)
      );
      if (thisMatchPredictionVote) {
        setThisMatchPredictionOfUsers(thisMatchPredictionVote.prediction);
        return;
      } else {
        setThisMatchPredictionOfUsers('No prediction vote');
        return;
      }
    } else {
      setThisMatchPredictionOfUsers(undefined);
      return;
    }
  }, [allPredictionVoteOfUsers, paramsMatchID]);

  //? コメント投稿に成功したら投票してねモーダルを消す&勝敗予想を再取得
  useEffect(() => {
    if (isSuccessVoteMatchPrediction) {
      refetchAllPredictionData();
      setIsPredictionModal(false);
    }
  }, [isSuccessVoteMatchPrediction]);
  //? コメント投稿失敗時
  // useEffect(() => {
  //   if (isErrorPostComment) {
  //     setToastModal({
  //       message: MESSAGE.COMMENT_POST_FAILED,
  //       bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR,
  //     });
  //     showToastModal();
  //   }
  // }, [isErrorPostComment]);

  //? コメント入力欄の高さを取得
  useEffect(() => {
    if (commentPostRef) {
      if (commentPostRef.current) {
        setCommentPostComponentHeight(
          (commentPostRef.current as HTMLSelectElement).clientHeight
        );
      }
    }
  }, [comment]);

  //? コメント投稿中にモーダル表示
  // useEffect(() => {
  //   if (isPostingComment) {
  //     startLoading();
  //   } else {
  //     resetLoadingState();
  //   }
  // }, [isPostingComment]);

  // ? コメント投稿成功時にコメント入力欄をclearメッセージモーダル
  useEffect(() => {
    if (isSuccessPostComment) {
      setComment('');
      //? textareaの高さをリセットと中身を削除
      (textareaRef.current as unknown as HTMLTextAreaElement).style.height =
        'auto';
      (textareaRef.current as unknown as HTMLTextAreaElement).value = '';
    }
  }, [isSuccessPostComment]);

  //? コメント取得中にLoadingモーダル表示
  useEffect(() => {
    if (isFetchingComments) {
      startLoading();
    } else {
      resetLoadingState();
    }
  }, [isFetchingComments]);

  //? コメント投稿
  const sendComment = () => {
    if (!authUser) {
      setToastModal({
        message: MESSAGE.FAILED_POST_COMMENT_WITHOUT_AUTH,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }
    if (!comment) {
      setToastModal({
        message: MESSAGE.COMMENT_IS_EMPTY,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }
    postComment({ matchId: paramsMatchID, comment });
    return;
  };
  // const commentDelete = (commentID: number) => {
  //   deleteComment({ commentID, matchID: paramsMatchID });
  // };

  const autoExpandTextareaAndSetComment = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const textarea = textareaRef.current as unknown as HTMLTextAreaElement;
    if (!textarea) return;
    if (textarea.scrollHeight > 250) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setComment(e.target.value);
  };

  const [_, setIsPredictionModal] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [selectPredictionBoxer, setSelectPredictionBoxer] = useState<{
    name: string;
    color: 'red' | 'blue';
  }>();
  //? 勝敗予想の投票
  const sendPrecition = () => {
    if (!selectPredictionBoxer) return;
    if (
      thisMatchPredictionOfUsers === 'red' ||
      thisMatchPredictionOfUsers === 'blue'
    )
      return;
    matchPrediction({
      matchID: paramsMatchID,
      prediction: selectPredictionBoxer.color,
    });
    setShowConfirmModal(false);
  };

  const predictionVote = ({
    name,
    color,
  }: {
    name: string;
    color: 'red' | 'blue';
  }) => {
    if (thisMatchPredictionOfUsers !== 'No prediction vote') return;
    setSelectPredictionBoxer({ name, color });
    setShowConfirmModal(true);
  };

  return (
    <>
      {/* //? Boxer */}
      <SetUpBoxers
        predictionVote={predictionVote}
        thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
        sendPrecition={sendPrecition}
        selectPredictionBoxer={selectPredictionBoxer}
        setShowConfirmModal={setShowConfirmModal}
        showConfirmModal={showConfirmModal}
        thisMatch={thisMatch}
        thisMatchPredictionCount={thisMatchPredictionCount}
        isFetchingComments={isFetchingComments}
      />
      <div className="flex w-full">
        {/* //? Left section (Match info) */}
        <LeftSection
          thisMatch={thisMatch}
          thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
        />
        {/* //? Comments */}
        <CommentsComponent
          paramsMatchID={paramsMatchID}
          commentPostTextareaHeight={commentPostTextareaHeight}
        />
      </div>

      <section
        ref={commentPostRef}
        className="fixed bottom-0 w-full flex bg-white/60 justify-center py-8 border-t-[1px] border-stone-200"
      >
        <div className="w-[70%] max-w-[800px]">
          <PostCommentTextarea
            setComment={setComment}
            comment={comment}
            sendComment={sendComment}
            textareaRef={textareaRef}
            autoExpandTextareaAndSetComment={autoExpandTextareaAndSetComment}
          />
        </div>
      </section>
    </>
  );
};

// ! post commnet textarea
type PostCommentTextareaType = {
  setComment: React.Dispatch<React.SetStateAction<string | undefined>>;
  sendComment: () => void;
  comment: string | undefined;
  textareaRef: React.MutableRefObject<null>;
  autoExpandTextareaAndSetComment: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

const PostCommentTextarea = ({
  sendComment,
  textareaRef,
  autoExpandTextareaAndSetComment,
}: PostCommentTextareaType) => {
  return (
    <div className="border-stone-400 bg-white relative border-[1px] pl-3 py-2 rounded-sm flex justify-center items-center">
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
        onClick={sendComment}
        className="absolute bottom-[7px] text-[14px] right-[10px] border-[1px] bg-stone-600 py-1 text-white pl-4 pr-3 tracking-[0.4em]"
      >
        送信
      </button>
    </div>
  );
};

// const BalloonModal = ({
//   setIsPredictionModal,
// }: {
//   setIsPredictionModal: React.Dispatch<React.SetStateAction<boolean>>;
// }) => {
//   return (
//     <>
//       <motion.div
//         animate={{ y: 10 }}
//         initial={{ x: -10 }}
//         transition={{
//           duration: 3,
//           repeat: Infinity,
//           repeatType: "mirror",
//           // type: "spring",
//           stiffness: 50,
//         }}
//         className="z-10 absolute top-[-60px] left-[calc(50%-150px)] bg-white shadow-lg shadow-stone-600/30 rounded-[25px] text-stone-700"
//       >
//         <button
//           onClick={() => setIsPredictionModal(false)}
//           className="text-stone-800 text-[20px] absolute top-4 right-4"
//         >
//           <AiOutlineClose />
//         </button>
//         <div className="bg-cyan-200/80 select-none w-full h-full p-10 rounded-[25px]">
//           <p>
//             勝利すると思う選手名をクリックして
//             <br />
//             勝敗予想を投票してください。
//           </p>
//         </div>
//       </motion.div>
//     </>
//   );
// };
