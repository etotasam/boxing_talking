import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios, { isAxiosError } from "@/libs/axios";
import Button from "@/components/Button";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { TestChart } from "@/components/chart";
import { RiBoxingFill } from "react-icons/ri";
import CommentDeleteModal from "@/components/CommentDeleteModal";
import SpinnerModal from "@/components/SpinnerModal";
import { CommentComponent } from "@/components/CommentComponent";
import { MessageModal, ModalBgColorType } from "@/components/MessageModal";
// import { selectvisibleModal } from "@/store/slice/messageByPostCommentSlice";

import {
  selectHasNotComments,
  fetchComments,
  selectComments,
  selectGettingCommentsState,
  commentClear,
} from "@/store/slice/commentsStateSlice";
import { logout, selectUser } from "@/store/slice/authUserSlice";
import { selectVotes, setVotes } from "@/store/slice/userVoteSlice";
import {
  MatchesType,
  FighterType,
  selectMatches,
} from "@/store/slice/matchesSlice";
import {
  selectMessage,
  setSuccessMessage,
} from "@/store/slice/messageByPostCommentSlice";
import PostCommentForm from "@/components/PostCommentForm";
// import * as MESSAGE from "@/libs/message";
import { MESSAGE } from "@/libs/utils";

export const Comments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allVote = useSelector(selectVotes);
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));
  const userLogout = async () => {
    try {
      await axios.post("api/logout");
      dispatch(logout());
      dispatch(setVotes(undefined));
      navigate("/login");
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response);
      }
    }
  };

  //コメント系slice
  const hasComments = useSelector(selectHasNotComments);
  const allCommentsByDB = useSelector(selectComments);

  const gettingCommentState = useSelector(selectGettingCommentsState);

  const [thisMatch, setThisMatch] = useState<MatchesType>();
  const getMatch = (thisMatch: MatchesType[], id: number) => {
    return thisMatch?.find((el) => el.id === id);
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
  const allMatches = useSelector(selectMatches) as MatchesType[];
  // const [commentsOnThisMatch, setCommentsOnThisMatch] = useState<CommentType[]>(
  //   []
  // );
  const [whichVoteOnDB, setWhichVoteOnDB] = useState<"red" | "blue">();
  // const [isGettingComments, setIsGettingComments] = useState(false);
  // const [isNotCommentYet, setIsNotCommentYet] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (Array.isArray(allVote)) {
          const userVoteMatch = allVote!.find((el) => el.match_id === matchId);
          if (userVoteMatch?.vote_for !== undefined && isMounted) {
            setWhichVoteOnDB(userVoteMatch?.vote_for);
          }
          const thisMatch = getMatch(allMatches, matchId);
          if (isMounted) {
            setThisMatch(thisMatch);
          }
          dispatch(fetchComments(matchId));
        }
      } catch (error: any) {
        console.log(error);
      }
      if (isMounted) {
        // setIsGettingComments(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
      // unMount時にメッセージを消去して、モーダルが出ない様にする
      dispatch(setSuccessMessage(MESSAGE.NULL));
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

  const preDeleteConfirmVisble = (commentId: number) => {
    setDeleteCommentId(commentId);
    setDeleteConfirmModal(true);
  };

  // let settimeID: any = null;
  const [settimeID, setSettimeID] = useState<any>();
  const wait = (ms: number) => {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      setSettimeID(id);
    });
  };

  const sleep = () => {
    const id = setTimeout(() => {
      dispatch(setSuccessMessage(MESSAGE.NULL));
      setErrorMessage(null);
    }, 3000);
    setSettimeID(id);
  };

  const operateMessageModal = async (
    message: MESSAGE,
    modalBgColor: ModalBgColorType
  ) => {
    clearTimeout(settimeID);
    dispatch(setSuccessMessage(message));
    if (modalBgColor !== null) {
      setErrorMessage(modalBgColor);
    }
    await wait(3000);
    dispatch(setSuccessMessage(MESSAGE.NULL));
    setErrorMessage(null);
    // sleep();
    // await wait(3000);
    // if(true) {
    //   dispatch(setSuccessMessage(MESSAGE.NULL));
    //   setErrorMessage(null);
    // }
  };

  const [errorMessage, setErrorMessage] = useState<ModalBgColorType | null>(
    ModalBgColorType.SUCCESS
  );
  const [invalidButton, setInvalidButton] = useState(false);
  const voteAPI = async (voteColor: "red" | "blue", matchId: number) => {
    if (invalidButton) return;
    setInvalidButton(true);
    try {
      const { data, statusText } = await axios.put(
        `/api/${matchId}/${voteColor}/vote`
      );
      console.log(data, statusText);
      const fighterName = thisMatch![voteColor].name;
      operateMessageModal(MESSAGE.VOTE_SUCCESSFULLY, ModalBgColorType.SUCCESS);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response && e.response.status === 406) {
          // const message = e.response.data.message as string;
          operateMessageModal(MESSAGE.VOTE_FAILD, ModalBgColorType.ERROR);
        }
      }
    }
    setInvalidButton(false);
  };

  const modalControle = (
    // comments: CommentType[],
    message: MESSAGE,
    bgColor: ModalBgColorType
  ) => {
    // setCommentsOnThisMatch(comments);
    operateMessageModal(message, bgColor);
  };
  useEffect(() => {
    if (!thisMatch || !voteIs) return;
    setYouVoteFighter(thisMatch[voteIs]);
  }, [voteIs]);
  const [youVoteFighter, setYouVoteFighter] = useState<FighterType>();
  const [deleteCommentId, setDeleteCommentId] = useState<number>();
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const messageFromCommentSlice = useSelector(selectMessage);
  const { name: userName, id: userId } = useSelector(selectUser);
  return (
    <>
      <h1>comments</h1>
      <p>{`${userName}さん`}</p>
      <Button onClick={userLogout}>logout</Button>
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
          onClick={() => voteAPI(voteIs!, matchId)}
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
            userId={userId}
            matchId={thisMatch.id}
            // commentsSetProp={(comments: CommentType[]) =>
            //   setCommentsOnThisMatch(comments)
            // }
            messageModaleSetProp={(
              message: MESSAGE,
              bgColor: ModalBgColorType
            ) => modalControle(message, bgColor)}
            // commentGettingStateProp={(state: boolean) =>
            //   setIsGettingComments(state)
            // }
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
                deleteConfirmModalVisible={(commentId: number) =>
                  preDeleteConfirmVisble(commentId)
                }
                className={`${
                  user.id === userId ? "bg-green-100" : "bg-gray-200"
                }`}
              />
            )
          )}
        {hasComments && <div>コメントはありません</div>}
        {gettingCommentState && <SpinnerModal />}
      </div>
      {messageFromCommentSlice && (
        <MessageModal
          message={messageFromCommentSlice}
          errorMessage={errorMessage}
        />
      )}
      {deleteConfirmModal && (
        <CommentDeleteModal
          userId={userId}
          deleteCommentId={deleteCommentId}
          deleteConfirmModalInvisible={() => setDeleteConfirmModal(false)}
          operateMessageModale={(message, bgColor) =>
            operateMessageModal(message, bgColor)
          }
        />
      )}
    </>
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
