import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios, { isAxiosError } from "@/libs/axios";
import Button from "@/components/Button";
import { useNavigate, useLocation, Link } from "react-router-dom";
import dayjs from "dayjs";
import { TestChart } from "@/components/chart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

import { logout, selectUser } from "@/store/slice/authUserSlice";
import { VoteColor, selectVotes, setVotes } from "@/store/slice/userVoteSlice";
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
import getThisMatchCommentsAPI, {
  CommentType,
} from "@/libs/apis/getThisMatchCommentsAPI";

const Trash: any = <FontAwesomeIcon icon={faTrashCan} />;

export const Comments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allVote = useSelector(selectVotes);
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));
  const out = async () => {
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

  const [thisMatch, setThisMatch] = useState<MatchesType>();
  const getMatch = (thisMatch: MatchesType[], id: number) => {
    return thisMatch?.find((el) => el.id === id);
  };

  const redFighterName = thisMatch?.red.name;
  const blueFighterName = thisMatch?.blue.name;
  const countRed = thisMatch?.count_red;
  const countBlue = thisMatch?.count_blue;

  const matchData = {
    labels: [redFighterName, blueFighterName],
    datasets: [
      {
        // label: "# of Votes",
        data: [countRed, countBlue],
        backgroundColor: ["#ff3131", "#164dff"],
        // borderColor: ["#ff0808", "#003cff"],
        borderWidth: 1,
      },
    ],
  };

  // data全般
  const allMatches = useSelector(selectMatches) as MatchesType[];
  const [comments, setComments] = useState<CommentType[]>();
  const [voteColor, setVoteColor] = useState<VoteColor>();
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (Array.isArray(allVote)) {
          const userVoteMatches = allVote!.find(
            (el) => el.match_id === matchId
          );
          if (userVoteMatches?.vote_for !== undefined && isMounted) {
            setVoteColor(userVoteMatches?.vote_for);
          }
          const thisMatch = getMatch(allMatches, matchId);
          if (isMounted) {
            setThisMatch(thisMatch);
          }
          // コメントの取得
          const commentsByDB: CommentType[] = await getThisMatchCommentsAPI(
            matchId
          );
          if (isMounted) {
            setComments(commentsByDB);
          }
        }
      } catch (error: any) {
        console.log(error);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const [color, setColor] = useState<VoteColor | undefined>();
  const testClick = async (matchId: number, vote: VoteColor) => {
    const hasVoteToThisMatch = allVote?.find((el) => el.match_id === matchId);

    let tempGameData: MatchesType = { ...thisMatch! };
    if (vote === VoteColor.RED && color !== VoteColor.RED) {
      tempGameData.count_red += 1;
      tempGameData.count_blue -= 1;
      setColor(VoteColor.RED);
    }
    if (vote === VoteColor.BLUE && color !== VoteColor.BLUE) {
      tempGameData.count_red -= 1;
      tempGameData.count_blue += 1;
      setColor(VoteColor.BLUE);
    }
    setThisMatch(tempGameData);

    // todo What should I do on DB...
    if (hasVoteToThisMatch) return;
    // dispatch(overwriteMatchState())
    const { data, statusText } = await axios.put(
      `/api/${matchId}/${vote}/vote`
    );
  };

  const preDeleteConfirmVisble = (commentId: number) => {
    setDeleteCommentId(commentId);
    setDeleteConfirmModal(true);
  };

  const [deleteCommentId, setDeleteCommentId] = useState<number>();
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const message = useSelector(selectMessage);
  const { name: userName, id: userId } = useSelector(selectUser);
  return (
    <>
      <h1>comments</h1>
      <p>{`${userName}さん`}</p>
      <Button onClick={out}>logout</Button>
      <div>
        <Link className="text-blue-400" to="/">
          Homeへ
        </Link>
      </div>
      <div className="w-[500px] p-5">
        <TestChart matchData={matchData} />
      </div>
      {/* 試合情報 */}
      {thisMatch && (
        <div className="w-[70%]">
          <h1 className="bg-gray-600 text-white">{thisMatch.date}</h1>
          <div className="flex">
            <Fighter
              fighter={thisMatch.red}
              voteCount={thisMatch.count_red}
              onClick={() => testClick(thisMatch.id, VoteColor.RED)}
              className={`${voteColor === `red` ? `bg-red-500` : `bg-red-200`}`}
            />
            <Fighter
              fighter={thisMatch.blue}
              voteCount={thisMatch.count_blue}
              onClick={() => testClick(thisMatch.id, VoteColor.BLUE)}
              className={`${
                voteColor === `blue` ? `bg-blue-500` : `bg-blue-200`
              }`}
            />
          </div>
          <PostCommentForm
            userId={userId}
            matchId={thisMatch.id}
            commentsSet={(comments: CommentType[]) => setComments(comments)}
          />
        </div>
      )}
      {/* コメント */}
      <div className="relative w-[70%]">
        {comments && (
          <div className="">
            {comments.map(({ id: commentId, comment, user, created_at }) => (
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
                className={`${user.id === userId && "bg-green-100"}`}
              />
            ))}
          </div>
        )}
      </div>
      {message && <MessageModal message={message} />}
      {deleteConfirmModal && (
        <CommentDeleteModal
          userId={userId}
          deleteCommentId={deleteCommentId}
          commentsReload={(comments: CommentType[]) => setComments(comments)}
          deleteConfirmModalInvisible={() => setDeleteConfirmModal(false)}
        />
      )}
    </>
  );
};

type FighterProps = {
  fighter: FighterType;
  className: string;
  onClick?: () => void;
  voteCount: number;
};

const Fighter = ({ fighter, className, onClick, voteCount }: FighterProps) => {
  return (
    <div onClick={onClick} className={`${className} w-1/2 cursor-pointer`}>
      <h2>
        {fighter.name} 投票数: {voteCount}
      </h2>
      <p>{fighter.country}</p>
      <p>{`${fighter.win}勝 ${fighter.draw}分 ${fighter.lose}敗 ${fighter.ko}KO`}</p>
    </div>
  );
};

type CommentDeleteModalType = {
  deleteConfirmModalInvisible: () => void;
  userId: number;
  deleteCommentId: number | undefined;
  commentsReload: (comments: CommentType[]) => void;
};

const CommentDeleteModal = ({
  deleteConfirmModalInvisible,
  userId,
  deleteCommentId,
  commentsReload,
}: CommentDeleteModalType) => {
  const parentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    deleteConfirmModalInvisible();
  };
  const childClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const dispatch = useDispatch();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));

  const [deleteProgressing, setDeleteProgressing] = useState<boolean>(false);
  const commentDelete = async () => {
    setDeleteProgressing(true);
    const { data }: { data: any } = await axios.delete("api/delete_comment", {
      data: {
        userId,
        commentId: deleteCommentId,
      },
    });
    const comments = await getThisMatchCommentsAPI(matchId);
    setDeleteProgressing(false);
    deleteConfirmModalInvisible();
    commentsReload(comments);
    dispatch(setSuccessMessage(data.message));
    setTimeout(() => {
      dispatch(setSuccessMessage(""));
    }, 5000);
  };

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);
  return (
    <div
      onClick={(e) => parentClick(e)}
      className="fixed top-0 left-0 w-full h-[100vh] comment-delete-modal flex justify-center items-center"
    >
      <div
        onClick={(e) => childClick(e)}
        className="w-1/3 py-4 px-3 bg-white rounded"
      >
        <p className="py-5 text-center">
          {deleteProgressing ? "削除中...." : "※コメントを削除します"}
        </p>
        {!deleteProgressing && (
          <div className="flex justify-center items-center">
            <Button
              onClick={commentDelete}
              className="bg-gray-500 hover:bg-gray-600"
            >
              削除
            </Button>
            <Button
              onClick={deleteConfirmModalInvisible}
              className="ml-10 bg-gray-500 hover:bg-gray-600"
            >
              キャンセル
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

type CommentPropsType = {
  commentId: number;
  comment: string;
  userName: string;
  createdAt: Date;
  className?: string;
  commentUserId: number;
  deleteConfirmModalVisible: (commentId: number) => void;
};
const dateFormat = (date: Date) => {
  return dayjs(date).format("YYYY/MM/DD h:mm");
};

const CommentComponent = ({
  commentId,
  comment,
  userName,
  createdAt,
  className,
  commentUserId,
  deleteConfirmModalVisible,
}: CommentPropsType) => {
  const { id: userId } = useSelector(selectUser);

  return (
    <div
      className={`relative border border-gray-300 rounded py-2 px-3 mt-3 ${className}`}
    >
      <h2>{userName}</h2>
      <div className="whitespace-pre-wrap">{comment}</div>
      <time className="text-gray-400 text-sm">{dateFormat(createdAt)}</time>
      {commentUserId === userId && (
        <button
          onClick={() => deleteConfirmModalVisible(commentId)}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          {Trash}
        </button>
      )}
    </div>
  );
};

const MessageModal = ({ message }: { message: string }) => {
  const dispatch = useDispatch();
  const click = () => {
    dispatch(setSuccessMessage(""));
  };
  return (
    <div
      onClick={click}
      className="fixed top-[20px] left-[50%] translate-x-[-50%] py-2 text-center w-1/2 bg-green-400 text-white rounded"
    >
      {message}
    </div>
  );
};
