import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectUser,
  selectAuth,
  logout,
  AuthIs,
} from "@/store/slice/authUserSlice";
import { selectMatches } from "@/store/slice/matchesSlice";
import { FighterType, MatchesType } from "@/store/slice/matchesSlice";
import Button from "@/components/Button";
import logoutAPI from "@/libs/apis/logout";
import axios from "@/libs/axios";

export const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: userId, name } = useSelector(selectUser);
  const isAuth: AuthIs = useSelector(selectAuth);
  const matchesState = useSelector(selectMatches);

  const MESSAGE = "※コメント閲覧、投稿にはログインが必要です";
  const click = (id: number) => {
    if (isAuth === AuthIs.TRUE) return navigate(`/comments?id=${id}`);
    navigate("/login", { state: { message: MESSAGE } });
  };

  const [matches, setMatches] = useState<MatchesType[] | undefined>(
    matchesState
  );

  const logoutFunc = async () => {
    await logoutAPI();
    dispatch(logout());
  };

  useEffect(() => {
    setMatches(matchesState);
    // if (matches) return;
    // (async () => {
    //   await getMatches();
    // })();
  }, []);

  const queue = async () => {
    const { data } = await axios.put(`api/${userId}/test`);
    console.log(data);
  };

  return (
    <>
      <h1>Home</h1>
      <Button onClick={queue}>Queue</Button>
      {isAuth === AuthIs.TRUE ? (
        <p data-testid={`name`}>{name}さん</p>
      ) : (
        <p data-testid={`guest`}>ゲストさん</p>
      )}
      {isAuth === AuthIs.TRUE ? (
        <Button onClick={logoutFunc}>logout</Button>
      ) : (
        <Link className="text-blue-500" to="/login">
          Loginページ
        </Link>
      )}

      {Array.isArray(matches) &&
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
