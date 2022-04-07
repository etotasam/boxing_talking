// module
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { isAxiosError } from "@/libs/axios";
import { useLocation, Link } from "react-router-dom";
import { RiBoxingFill } from "react-icons/ri";

// components
import Button from "@/components/Button";
import { TestChart } from "@/components/chart";
import CommentDeleteModal from "@/components/CommentDeleteModal";
import SpinnerModal from "@/components/SpinnerModal";
import FullScreenSpinnerModal from "@/components/FullScreenSpinnerModal";
import { CommentComponent } from "@/components/CommentComponent";
import { voteAPI } from "@/libs/apis/voteAPI";
import PostCommentForm from "@/components/PostCommentForm";

// slice
import {
  useHasNotComment,
  fetchThisMatchesComments,
  useComments,
  useGettingCommentsState,
  commentClear,
} from "@/store/slice/commentsStateSlice";
import { useVotes, fetchUserVotes } from "@/store/slice/userVoteSlice";
import {
  MatchesType,
  FighterType,
  useMatches,
  fetchMatches,
} from "@/store/slice/matchesSlice";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";

// custom hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useMessageController } from "@/libs/hooks/messageController";
import { MESSAGE } from "@/libs/utils";
import { useLoginController } from "@/libs/hooks/authController";
import { usePostComment } from "@/libs/hooks/postComment";
import { useCommentDelete } from "@/libs/hooks/commentDelete";

export const Comments = () => {
  const dispatch = useDispatch();
  const { commentPostPending } = usePostComment();
  // const navigate = useNavigate();
  const { logoutCont, pending: authContPending } = useLoginController();
  const { setMessageToModal } = useMessageController();
  const { isOpenDeleteConfirmModal, isDeletingPending } = useCommentDelete();
  const allVote = useVotes();
  const { authUser } = useAuth();
  const { name: userName, id: userId } = authUser;
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));

  //コメント系slice
  const hasNotComments = useHasNotComment();
  const allCommentsByDB = useComments();

  const gettingCommentState = useGettingCommentsState();

  const [isCommentPending, setIsCommentPending] = useState(false);

  const [thisMatch, setThisMatch] = useState<MatchesType>();
  const getThisMatch = (matches: MatchesType[], id: number) => {
    return matches?.find((match) => match.id === id);
  };

  const redFighterName = thisMatch?.red.name;
  const blueFighterName = thisMatch?.blue.name;
  const countRed = thisMatch?.count_red;
  const countBlue = thisMatch?.count_blue;

  const matchData = {
    labels: [blueFighterName, redFighterName],
    datasets: [
      {
        // label: "# of Votes",
        data: [countBlue, countRed],
        backgroundColor: ["rgb(86, 153, 254)", "rgb(252, 113, 113)"],
        // borderColor: ["#ff0808", "#003cff"],
        borderWidth: 1,
      },
    ],
  };

  // data全般
  const allMatches = useMatches() as MatchesType[];
  const [whichVoteOnDB, setWhichVoteOnDB] = useState<"red" | "blue">();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (Array.isArray(allVote)) {
          const userVoteMatch = allVote!.find((el) => el.match_id === matchId);
          if (userVoteMatch?.vote_for !== undefined && isMounted) {
            setWhichVoteOnDB(userVoteMatch?.vote_for);
          }
          const match = getThisMatch(allMatches, matchId);
          if (isMounted) {
            setThisMatch(match);
          }
          dispatch(fetchThisMatchesComments(matchId));
        }
      } catch (error: any) {
        console.log(error);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
      dispatch(commentClear());
    };
  }, []);

  useEffect(() => {
    if (!whichVoteOnDB) return;
    setVoteIs(whichVoteOnDB);
  }, [whichVoteOnDB]);
  const [voteIs, setVoteIs] = useState<"red" | "blue">();
  const voteToFighter = async (vote: "red" | "blue") => {
    let tempGameData: MatchesType = { ...thisMatch! };
    if (vote === "red" && voteIs !== "red") {
      tempGameData.count_red += 1;
      if (voteIs === "blue") {
        tempGameData.count_blue -= 1;
      }
      setVoteIs("red");
    }
    if (vote === "blue" && voteIs !== "blue") {
      if (voteIs === "red") {
        tempGameData.count_red -= 1;
      }
      tempGameData.count_blue += 1;
      setVoteIs("blue");
    }
    setThisMatch(tempGameData);
  };

  const [invalidButton, setInvalidButton] = useState(false);
  const voteFunc = async (voteColor: "red" | "blue", matchId: number) => {
    if (invalidButton) return;
    setInvalidButton(true);
    try {
      await voteAPI(voteColor, matchId);
      dispatch(fetchUserVotes(userId));
      dispatch(fetchMatches());
      setMessageToModal(MESSAGE.VOTE_SUCCESSFULLY, ModalBgColorType.SUCCESS);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response && e.response.status === 406) {
          setMessageToModal(MESSAGE.VOTE_FAILD, ModalBgColorType.ERROR);
        }
      }
    }
    setInvalidButton(false);
  };

  useEffect(() => {
    if (!thisMatch || !voteIs) return;
    setYouVoteFighter(thisMatch[voteIs]);
  }, [voteIs]);
  const [youVoteFighter, setYouVoteFighter] = useState<FighterType>();
  // const [deleteCommentId, setDeleteCommentId] = useState<number>();

  return (
    <div className="relative">
      <h1>comments</h1>
      <p>{`${userName}さん`}</p>
      <Button onClick={logoutCont}>logout</Button>
      <div>
        <Link className="text-blue-400" to="/">
          Homeへ
        </Link>
      </div>
      <div className="w-[500px]">
        <TestChart matchData={matchData} />
      </div>
      {/* 試合情報 */}
      {youVoteFighter && (
        <Button
          onClick={() => voteFunc(voteIs!, matchId)}
          className={`${
            whichVoteOnDB === voteIs && "pointer-events-none bg-gray-400"
          }`}
        >
          {youVoteFighter.name}に投票する
        </Button>
      )}
      {thisMatch && (
        <div className="w-[70vw]">
          <h1 className="bg-gray-600 text-white">{thisMatch.date}</h1>
          <div className="flex">
            <FighterComponent
              fighter={thisMatch.red}
              voteCount={thisMatch.count_red}
              voteColor={voteIs}
              onClick={() => voteToFighter("red")}
              color={"red"}
              className={"fighter-color-red"}
            />
            <FighterComponent
              fighter={thisMatch.blue}
              voteCount={thisMatch.count_blue}
              voteColor={voteIs}
              onClick={() => voteToFighter("blue")}
              color={"blue"}
              className={"fighter-color-blue"}
            />
          </div>
          <PostCommentForm
            isPostCommentPending={(bool: boolean) => setIsCommentPending(bool)}
            userId={userId}
            matchId={thisMatch.id}
          />
        </div>
      )}
      {/* コメント */}
      <div className="relative w-[70vw] h-full">
        {allCommentsByDB &&
          allCommentsByDB.map(
            ({ id: commentId, comment, user, created_at }) => (
              <CommentComponent
                key={commentId}
                commentId={commentId}
                commentUserId={user.id}
                comment={comment}
                userName={user.name}
                createdAt={created_at}
                className={`${
                  user.id === userId ? "bg-green-100" : "bg-gray-200"
                }`}
              />
            )
          )}
        {hasNotComments && <div>コメントはありません</div>}
        {(gettingCommentState || commentPostPending || isDeletingPending) && (
          <SpinnerModal />
        )}
      </div>
      {/* {messageFromCommentSlice && <MessageModal />} */}
      {isOpenDeleteConfirmModal && <CommentDeleteModal userId={userId} />}
      {(authContPending || isCommentPending) && <FullScreenSpinnerModal />}
    </div>
  );
};

type FighterComponentProps = {
  fighter: FighterType;
  className: string;
  voteColor: "red" | "blue" | undefined;
  onClick?: () => void;
  voteCount: number;
  color: "red" | "blue";
};

const FighterComponent = ({
  fighter,
  className,
  onClick,
  voteCount,
  voteColor,
  color,
}: FighterComponentProps) => {
  return (
    <div onClick={onClick} className={`w-1/2 cursor-pointer ${className}`}>
      <div className={"h-[30px] flex justify-center items-center"}>
        {voteColor === color && (
          <RiBoxingFill className={"text-white text-2xl"} />
        )}
      </div>
      <h2>
        {fighter.name} 投票数: {voteCount}
      </h2>
      <p>{fighter.country}</p>
      <p>{`${fighter.win}勝 ${fighter.draw}分 ${fighter.lose}敗 ${fighter.ko}KO`}</p>
    </div>
  );
};
