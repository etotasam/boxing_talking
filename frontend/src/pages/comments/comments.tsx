// module
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

// components
import { LayoutDefault } from "@/layout/LayoutDefault";
import CommentDeleteModal from "@/components/CommentDeleteModal";
// import FullScreenSpinnerModal from "@/components/FullScreenSpinnerModal";
import PostCommentForm from "@/components/PostCommentForm";
import { MatchInfo } from "@/components/MatchInfo";
import { CommentsContainer } from "@/components/CommentsContainer";

//api
import { MatchesType, FighterType } from "@/libs/apis/fetchMatchesAPI";

// slice
// import {
//   useHasNotComment,
//   fetchThisMatchesComments,
//   useComments,
//   useGettingCommentsState,
//   commentClear,
//   cancelGetCommentsAxios,
// } from "@/store/slice/commentsStateSlice";
import { useVoteResultState, fetchUserVotes } from "@/store/slice/allVoteResultSlice";
// import {
//   MatchesType,
//   FighterType,
//   useMatches,
//   fetchMatches,
// } from "@/store/slice/matchesSlice";
// import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";

// custom hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useMessageController } from "@/libs/hooks/messageController";
import { MESSAGE } from "@/libs/utils";
import { useLogout } from "@/libs/hooks/useLogout";
import { usePostComment } from "@/libs/hooks/usePostComment";
import { useCommentDelete } from "@/libs/hooks/useCommentDelete";
import { useResizeCommentsComponent } from "@/libs/hooks/useResizeCommentsComponent";
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";
import { useFetchVoteResult } from "@/libs/hooks/useFetchVoteResult";
import { useFetchThisMatchComments } from "@/libs/hooks/useFetchThisMatchComments";

export const Comments = () => {
  const dispatch = useDispatch();
  // const { commentPostPending } = usePostComment();
  const { logoutState } = useLogout();
  const { setMessageToModal } = useMessageController();
  const { deleteCommentsState } = useCommentDelete();
  const { commentsState } = useFetchThisMatchComments();
  const { authState } = useAuth();

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));

  // ユーザー情報
  const { user: authUser } = authState;

  // ▼▼▼▼▼▼commentsコンポーネントのサイズを動的にする▼▼▼▼▼▼
  // const matchesRef = useRef<HTMLDivElement>(null);
  // const chartRef = useRef<HTMLDivElement>(null);
  // const commentRef = useRef<HTMLDivElement>(null);
  // useResizeCommentsComponent({ matchesRef, chartRef, commentRef });

  //コメント系slice
  // const hasNotComments = useHasNotComment();
  // const allCommentsByDB = useComments();
  // const gettingCommentState = useGettingCommentsState();
  // const [isCommentPending, setIsCommentPending] = useState(false);

  // 試合情報
  const { matchesState } = useFetchAllMatches();
  const { voteResultState } = useFetchVoteResult();
  const [thisMatch, setThisMatch] = useState<MatchesType>();
  const getThisMatch = (matches: MatchesType[], matchIdByPrams: number): MatchesType | undefined => {
    return matches?.find((match) => match.id === matchIdByPrams);
  };

  useEffect(() => {
    if (!matchesState.matches) return;
    const match = getThisMatch(matchesState.matches, matchId);
    setThisMatch(match);
  }, [matchesState.matches]);

  // data全般
  const [whichVoteOnDB, setWhichVoteOnDB] = useState<"red" | "blue">();

  // useEffect(() => {
  //   let isMounted = true;
  //   const fetchData = async () => {
  //     try {
  //       if (Array.isArray(voteResultState.votes)) {
  //         const userVoteMatch = voteResultState.votes!.find((el) => el.match_id === matchId);
  //         if (userVoteMatch?.vote_for !== undefined && isMounted) {
  //           setWhichVoteOnDB(userVoteMatch?.vote_for);
  //         }
  //         const match = getThisMatch(matchesState.matches!, matchId);
  //         if (isMounted) {
  //           setThisMatch(match);
  //         }
  //       }
  //     } catch (error: any) {
  //       console.log(error);
  //     }
  //   };
  //   fetchData();
  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  // Commets Componentの高さを決めるコード(cssの変数を操作)
  const [elRefArray, setElRefArray] = useState<React.RefObject<HTMLDivElement>[]>([]);
  const [elsArray, setElsArray] = useState<(HTMLDivElement | null)[]>([]);

  // refからelementを取得
  useEffect(() => {
    const result = elRefArray.reduce((acc: (HTMLDivElement | null)[], curr) => {
      return [...acc, curr.current];
    }, []);
    setElsArray(result);
  }, [elRefArray]);

  useResizeCommentsComponent(...elsArray);

  return (
    <LayoutDefault>
      <div className="grid grid-cols-2">
        <div className="col-span-1">
          <MatchInfo getElRefArray={(arr: any[]) => setElRefArray((v) => [...v, ...arr])} />
          {thisMatch && (
            <PostCommentForm getPostComRef={(el: any) => setElRefArray((v) => [...v, el])} matchId={thisMatch.id} />
          )}
        </div>
        <div className={`col-span-1 p-5 t-comment-height`}>
          <CommentsContainer />
        </div>
        {deleteCommentsState.confirmModalVisble && <CommentDeleteModal userId={authUser.id} />}
        {/* {logoutState.pending && <FullScreenSpinnerModal />} */}
      </div>
    </LayoutDefault>
  );
};

// type FighterComponentProps = {
//   fighter: FighterType;
//   className: string;
//   voteColor: "red" | "blue" | undefined;
//   onClick?: () => void;
//   voteCount: number;
//   color: "red" | "blue";
// };

// const FighterComponent = ({ fighter, className, onClick, voteCount, voteColor, color }: FighterComponentProps) => {
//   return (
//     <div onClick={onClick} className={`w-1/2 cursor-pointer ${className}`}>
//       <div className={"h-[30px] flex justify-center items-center"}>
//         {voteColor === color && <RiBoxingFill className={"text-white text-2xl"} />}
//       </div>
//       <h2>
//         {fighter.name} 投票数: {voteCount}
//       </h2>
//       <p>{fighter.country}</p>
//       <p>{`${fighter.win}勝 ${fighter.draw}分 ${fighter.lose}敗 ${fighter.ko}KO`}</p>
//     </div>
//   );
// };
