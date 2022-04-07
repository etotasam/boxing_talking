import React, { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  // useUser,
  // useHasAuth,
  // logout,
  AuthIs,
} from "@/store/slice/authUserSlice";
import { FighterType } from "@/store/slice/matchesSlice";
import Button from "@/components/Button";
import { useAuth } from "@/libs/hooks/useAuth";
import { useGetAllMatches } from "@/libs/hooks/getAllMatches";
import axios from "@/libs/axios";
import { useLoginController } from "@/libs/hooks/authController";
import FullScreenSpinnerModal from "@/components/FullScreenSpinnerModal";

export const Home = () => {
  const navigate = useNavigate();
  // const { id: userId, name } = useUser();
  // const isAuth: AuthIs = useHasAuth();
  const { authUser, hasAuth } = useAuth();
  const { allMatches } = useGetAllMatches();
  const { logoutCont, pending: authContPending } = useLoginController();
  // const allMatches = useMatches();

  const MESSAGE = "※コメント閲覧、投稿にはログインが必要です";
  const click = (id: number) => {
    if (hasAuth === AuthIs.TRUE) return navigate(`/comments?id=${id}`);
    navigate("/login", { state: { message: MESSAGE } });
  };

  const queue = useCallback(async () => {
    const { data } = await axios.put(`api/${authUser.id}/test`);
    console.log(data);
  }, [authUser]);

  const logoutFunc = () => {
    logoutCont();
  };

  return (
    <div className="relative">
      <h1>Home</h1>
      {/* <Button onClick={queue}>Queue</Button> */}
      {hasAuth === AuthIs.TRUE ? (
        <p data-testid={`name`}>{authUser.name}さん</p>
      ) : (
        <p data-testid={`guest`}>ゲストさん</p>
      )}
      {hasAuth === AuthIs.TRUE ? (
        <Button data_testid={"logout-button"} onClick={logoutCont}>
          logout
        </Button>
      ) : (
        <Link className="text-blue-500" to="/login">
          Loginページ
        </Link>
      )}

      {Array.isArray(allMatches) &&
        allMatches.map((match) => (
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
      {authContPending && <FullScreenSpinnerModal />}
    </div>
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
