import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectAuth } from "@/store/slice/authUserSlice";
import { selectMatches, setMatchesState } from "@/store/slice/matchesSlice";
import { FighterType, MatchesType } from "@/libs/types";

export const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { name } = useSelector(selectUser);
  const isAuth = useSelector(selectAuth);
  const matchesState = useSelector(selectMatches);

  const MESSAGE = "※コメント閲覧、投稿にはログインが必要です";
  const click = (id: number) => {
    if (isAuth) return navigate(`/comments?id=${id}`);
    navigate("/login", { state: { message: MESSAGE } });
  };

  // type MatchesType = {
  //   id: number;
  //   date: string;
  //   red: FighterType;
  //   blue: FighterType;
  // };

  const [matches, setMatches] = useState<MatchesType[] | undefined>(
    matchesState
  );
  const getMatches = async () => {
    try {
      const { data }: { data: MatchesType[] } = await axios.get("api/match");
      dispatch(setMatchesState(data));
      setMatches(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (matches) return;
    (async () => {
      await getMatches();
    })();
  }, []);

  return (
    <>
      <h1>Home</h1>
      {isAuth ? <p>{name}さん</p> : <p>ゲストさん</p>}
      <div>
        <Link className="text-blue-500" to="/login">
          Loginページ
        </Link>
      </div>
      {/* <div
        onClick={click}
        className="flex w-[500px] bg-green-100 cursor-pointer"
      >
        <div className="bg-blue-400 w-1/2">
          <p>inoue</p>
          <p>成績</p>
        </div>
        <div className="bg-red-400 w-1/2">
          <p>lomachenko</p>
          <p>成績</p>
        </div>
      </div> */}
      {matches &&
        matches.map((match) => (
          <div
            onClick={() => click(match.id)}
            key={match.id}
            className={"border p-3 mt-2 cursor-pointer"}
          >
            <h1>{match.date}</h1>
            <div className="flex">
              <Fighter fighter={match.red} className={"bg-red-400 w-1/2"} />
              <Fighter fighter={match.blue} className={"bg-blue-400 w-1/2"} />
            </div>
          </div>
        ))}
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
      {fighter && (
        <>
          <p>{fighter.name}</p>
          <p>{fighter.country}</p>
          <p>{`${fighter.win}勝 ${fighter.draw}分 ${fighter.lose}敗 ${fighter.ko}KO`}</p>
        </>
      )}
    </div>
  );
};
