import React, { useEffect, useState, useRef } from 'react';
// import { AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import dayjs from 'dayjs';
// import { useRecoilValue } from "recoil";
// import { loginModalSelector } from "@/store/loginModalState";
// import { loadingSelector } from "@/store/loadingState";
// import japanFlag from "@/assets/images/flags/japan.svg";
//! types
import { BoxerType, MatchesDataType } from '@/assets/types';
// ! hook
import { useAuth } from '@/hooks/useAuth';
import { useToastModal } from '@/hooks/useToastModal';
import { useLoading } from '@/hooks/useLoading';
import { useFetchMatches } from '@/hooks/useMatch';
import { usePagePath } from '@/hooks/usePagePath';
import { useHeaderAndBottomHeight } from '@/hooks/useHeaderAndBottomHeightState';
import {
  useVoteMatchPrediction,
  useFetchMatchPredictVote,
} from '@/hooks/uesWinLossPredition';
import { usePostComment, useFetchComments } from '@/hooks/useComment';
//! component
import { BackgroundFlag } from '@/components/atomc/BackgroundFlag';
import { SelectedMatchInfo } from '@/page/Admin/MatchEdit';
import { EngNameWithFlag } from '@/components/atomc/EngNameWithFlag';
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
  const {
    data: comments,
    isLoading: isFetchingComments,
    isError: isErrorFetchComments,
  } = useFetchComments(paramsMatchID);
  // console.log(comments);
  const { setter: setPagePath } = usePagePath();
  const { data: authUser } = useAuth();
  // const { deleteComment } = useDeleteComment();
  const {
    postComment,
    isSuccess: isSuccessPostComment,
    // isLoading: isPostingComment,
    // isError: isErrorPostComment,
  } = usePostComment();
  const {
    setMiddleContentHeight,
    // setBottomHeight,
    state: excludeHeight,
  } = useHeaderAndBottomHeight();
  // console.log(excludeHeight);

  //? useState
  const [comment, setComment] = useState<string>();
  const [commentPostComponentHeight, setCommentPostComponentHeight] =
    useState<number>();
  const [thisMatch, setThisMatch] = useState<MatchesDataType>();
  const [thisMatchPredictionCount, setThisMatchPredictionCount] = useState<
    Record<'redCount' | 'blueCount' | 'totalCount', number>
  >({ redCount: 0, blueCount: 0, totalCount: 0 });

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
  const boxerSectionRef = useRef(null);

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    //? ページpathをRecoilに保存
    setPagePath(pathname);
    return () => {
      resetLoadingState();
    };
  }, []);

  //? boxer sectionの高さを取得
  useEffect(() => {
    if (boxerSectionRef.current) {
      const height = (boxerSectionRef?.current as unknown as HTMLElement)
        .clientHeight;
      setMiddleContentHeight(height);
    }
  }, [boxerSectionRef.current]);

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

  const [selectpredictionBoxer, setSelectPredictionBoxer] = useState<{
    name: string;
    color: 'red' | 'blue';
  }>();
  //? 勝敗予想の投票
  const sendPrecition = () => {
    if (!selectpredictionBoxer) return;
    if (thisMatchPredictionOfUsers) return;
    matchPrediction({
      matchID: paramsMatchID,
      prediction: selectpredictionBoxer.color,
    });
    setShowConfirmModal(false);
  };

  const prediction = ({
    name,
    color,
  }: {
    name: string;
    color: 'red' | 'blue';
  }) => {
    if (thisMatchPredictionOfUsers) return;
    setSelectPredictionBoxer({ name, color });
    setShowConfirmModal(true);
  };

  const getPredictionCountPercent = (predictionCoount: number) => {
    const percent = Math.ceil(
      (predictionCoount / thisMatchPredictionCount.totalCount) * 100
    );
    if (percent) {
      return percent;
    } else {
      return 0;
    }
  };

  return (
    <>
      {/* //? boxer */}
      {thisMatch && (
        <section
          ref={boxerSectionRef}
          className="flex border-b-[1px] h-[100px] relative"
        >
          {/* {isPrectionModal && !thisMatchPredictionOfUsers && !isLoading && (
            <BalloonModal setIsPredictionModal={setIsPredictionModal} />
          )} */}
          {/* //? 投票確認モーダル */}
          {showConfirmModal && (
            <PredictionConfirmModal
              boxerName={selectpredictionBoxer!.name!}
              execution={sendPrecition}
              cancel={() => setShowConfirmModal(false)}
            />
          )}
          <BoxerBox
            boxerColor={thisMatch.red_boxer}
            color="red"
            thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
            prediction={prediction}
          />
          <BoxerBox
            boxerColor={thisMatch.blue_boxer}
            color="blue"
            thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
            prediction={prediction}
          />
          {!isFetchingComments && (
            <>
              <motion.span
                initial={{ width: 0 }}
                animate={{
                  width: `${getPredictionCountPercent(
                    thisMatchPredictionCount.redCount
                  )}%`,
                }}
                transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                // style={{ width: `${red}%` }}
                className="bolck absolute bottom-0 left-0 bg-red-600 h-2"
              />
              <motion.span
                initial={{ width: 0 }}
                animate={{
                  width: `${getPredictionCountPercent(
                    thisMatchPredictionCount.blueCount
                  )}%`,
                }}
                transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                className="bolck absolute bottom-0 right-0 bg-blue-600 h-2"
              />
            </>
          )}
        </section>
      )}
      <div className="flex w-full">
        {/* //? match info */}
        <div className="w-[30%]">
          <div className="sticky top-5">
            <div className="w-full">
              <div className="flex justify-center mt-5">
                <SelectedMatchInfo matchData={thisMatch} />
              </div>
              {/* //? 自身の投票と投票数 */}
              {thisMatchPredictionOfUsers && (
                <div className="flex justify-center mt-5">
                  <div className="w-[80%]">
                    {thisMatchPredictionOfUsers === 'red' && (
                      <p className="text-center">
                        {thisMatch?.red_boxer.name}の勝利を予想しました
                      </p>
                    )}
                    {thisMatchPredictionOfUsers === 'blue' && (
                      <p className="text-center">
                        {thisMatch?.blue_boxer.name}の勝利を予想しました
                      </p>
                    )}
                    <div className="flex">
                      <div className="flex-1 flex justify-center">
                        <div className="rounded-[50%] w-[60px] h-[60px] flex justify-center items-center bg-red-500">
                          <p className="text-white text-[24px]">
                            {thisMatch?.count_red}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="rounded-[50%] w-[60px] h-[60px] flex justify-center items-center bg-blue-500">
                          <p className="text-white text-[24px]">
                            {thisMatch?.count_blue}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* //? comments */}
        {comments && Boolean(comments.length) ? (
          <section
            className="w-[70%] border-l-[1px] border-stone-200"
            style={{
              marginBottom: `${commentPostComponentHeight}px`,
              minHeight: `calc(100vh - (${excludeHeight}px + ${commentPostComponentHeight}px) - 1px)`,
            }}
          >
            <AnimatePresence>
              {comments.map((commentData) => (
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
          <div
            className="flex justify-center items-center text-[18px] border-l-[1px] w-[70%]"
            style={{
              // marginBottom: `${commentPostComponentHeight}px`,
              minHeight: `calc(100vh - (${excludeHeight}px + ${commentPostComponentHeight}px) - 1px)`,
            }}
          >
            <p>まだコメントがありません…</p>
          </div>
        ) : (
          isErrorFetchComments && (
            <div>
              コメントの取得に失敗しました。お手数ですがページの更新を行ってください。
            </div>
          )
        )}
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

type PredictionConfirmModalType = {
  boxerName: string;
  execution: () => void;
  cancel: () => void;
};

const PredictionConfirmModal = ({
  boxerName,
  execution,
  cancel,
}: PredictionConfirmModalType) => {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-[100vh] flex justify-center items-center">
        <div className="px-10 py-5 rounded-lg bg-white shadow-lg shadow-stone-500/50">
          <p>
            <span className="text-[18px] mx-2">{boxerName}</span>
            が勝つと思いますか？
          </p>
          <div className="flex justify-between mt-5">
            <button
              onClick={execution}
              className="bg-red-500 text-white py-1 px-5 rounded-md"
            >
              はい
            </button>
            <button
              onClick={cancel}
              className="bg-stone-500 text-white py-1 px-5 rounded-md"
            >
              わからない
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

type BoxerBoxType = {
  boxerColor: BoxerType;
  color: 'red' | 'blue';
  thisMatchPredictionOfUsers: 'red' | 'blue' | 'No prediction vote' | undefined;
  prediction: ({
    name,
    color,
  }: {
    name: string;
    color: 'red' | 'blue';
  }) => void;
};

const BoxerBox = ({
  boxerColor,
  color,
  thisMatchPredictionOfUsers,
  prediction,
}: BoxerBoxType) => {
  return (
    <div className="flex-1 py-5 relative">
      <BackgroundFlag nationaly={boxerColor.country} />

      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col justify-center items-center">
        {thisMatchPredictionOfUsers !== 'No prediction vote' ? (
          <>
            <EngNameWithFlag
              boxerCountry={boxerColor.country}
              boxerEngName={boxerColor.eng_name}
            />
            <h2 className="text-[20px]">{boxerColor.name}</h2>
          </>
        ) : (
          <div
            onClick={() =>
              prediction({
                name: boxerColor.name,
                color,
              })
            }
            className="flex flex-col justify-center items-center min-w-[250px] px-5 py-1 rounded-md border-[1px] border-stone-300 md:hover:bg-stone-300/80 cursor-pointer"
          >
            <EngNameWithFlag
              boxerCountry={boxerColor.country}
              boxerEngName={boxerColor.eng_name}
            />
            <h2 className="lg:text-[20px] text-[16px]">{boxerColor.name}</h2>
          </div>
        )}
      </div>
    </div>
  );
};
