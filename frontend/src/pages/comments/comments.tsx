import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios, { isAxiosError } from "@/libs/axios";
import { logout, selectUser } from "@/store/slice/authUserSlice";
import { selectMatches, setMatchesState } from "@/store/slice/matchesSlice";
import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { MatchesType, FighterType, UserType } from "@/libs/types";

export const Comments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const matches = useSelector(selectMatches);
  // const location = useLocation();
  const search = useLocation().search;
  const query = new URLSearchParams(search);
  const out = async () => {
    try {
      await axios.post("api/logout");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response);
      }
    }
  };

  const [game, setGame] = useState<MatchesType>();
  const getMatch = (game: MatchesType[], id: number) => {
    const data = game?.find((el) => el.id === id);
    setGame(data);
    // console.log(test);
  };

  type CommentType = {
    id: number;
    user: UserType;
    comment: string;
  };

  const [comments, setComments] = useState<CommentType[]>();
  const getComments = async (matchId: number): Promise<CommentType[]> => {
    const { data }: { data: CommentType[] } = await axios.get(
      "api/get_comments",
      {
        params: {
          match_id: matchId,
        },
      }
    );
    return data;
    // setComments(data);
  };

  const isComments = (el: CommentType[] | undefined): el is CommentType[] => {
    return el !== undefined;
  };

  const [isLoadin, setIsLoading] = useState(false);
  useEffect(() => {
    let comments: CommentType[] | undefined = undefined;
    const matchId = Number(query.get("id"));
    (async () => {
      setIsLoading(true);
      if (matches) {
        getMatch(matches, matchId);
      } else {
        const { data }: { data: MatchesType[] } = await axios.get("api/match");
        dispatch(setMatchesState(data));
        getMatch(data, matchId);
      }
      comments = await getComments(matchId);
      if (isComments(comments)) {
        setComments(comments);
      }
      setIsLoading(false);
    })();
  }, []);

  const { name, id: userId } = useSelector(selectUser);

  if (isLoadin)
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-green-100">
        <h1>loading...</h1>
      </div>
    );
  return (
    <>
      <h1>comments</h1>
      <p>{name}さん</p>
      <Button onClick={out}>logout</Button>
      <div>
        <Link className="text-blue-400" to="/">
          Homeへ
        </Link>
      </div>
      {/* 試合情報 */}
      {game && (
        <div className="w-[70%]">
          <h1 className="bg-gray-600 text-white">{game.date}</h1>
          <div className="flex">
            <Fighter fighter={game.red} className={"bg-red-200 w-1/2"} />
            <Fighter fighter={game.blue} className={"bg-blue-200 w-1/2"} />
          </div>
        </div>
      )}
      {/* コメント */}
      {comments && (
        <div className="w-[70%]">
          {comments.map(({ id, comment, user }) => (
            <Comment key={id} comment={comment} userName={user.name} />
          ))}
        </div>
      )}
      {game && <PostCommentForm userId={userId} matchId={game.id} />}
    </>
  );
};

type FighterProps = {
  fighter: FighterType;
  className: string;
};

const Fighter = ({ fighter, className }: FighterProps) => {
  return (
    <div className={className}>
      <h2>{fighter.name}</h2>
      <p>{fighter.country}</p>
      <p>{`${fighter.win}勝 ${fighter.draw}分 ${fighter.lose}敗 ${fighter.ko}KO`}</p>
    </div>
  );
};

type CommentProps = {
  comment: string;
  userName: string;
};
const Comment = ({ comment, userName }: CommentProps) => {
  return (
    <div className="border border-gray-300 rounded py-2 px-3 mt-3">
      <h2>{userName}</h2>
      <p>{comment}</p>
    </div>
  );
};

const PostCommentForm = ({
  userId,
  matchId,
}: {
  userId: number;
  matchId: number;
}) => {
  const [comment, setComment] = useState<string>();
  const PostComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data } = await axios.post("api/post_comment", {
      userId,
      matchId,
      comment,
    });
    console.log(data);
  };
  return (
    <div>
      <form onSubmit={PostComment}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={
            "border border-gray-300 rounded py-2 px-3 resize-none w-[300px] h-[100px]"
          }
        />
        <button>送信</button>
      </form>
    </div>
  );
};
