import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthIs } from "@/store/slice/authUserSlice";
import { FighterType } from "@/libs/apis/fetchMatchesAPI";
import { useAuth } from "@/libs/hooks/useAuth";
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";

export const Matches = React.memo(() => {
  const navigate = useNavigate();
  const {
    authState: { hasAuth },
  } = useAuth();
  const { matchesState } = useFetchAllMatches();

  const MESSAGE = "※コメント閲覧、投稿にはログインが必要です";
  const click = (id: number) => {
    if (hasAuth === AuthIs.TRUE) return navigate(`/comments?id=${id}`);
    navigate("/login", { state: { message: MESSAGE } });
  };
  return (
    <>
      {Array.isArray(matchesState.matches) &&
        matchesState.matches.map((match) => (
          <div onClick={() => click(match.id)} key={match.id} className={"border p-3 mt-2 cursor-pointer"}>
            <h1>{match.date}</h1>
            <div className="flex">
              <Fighter fighter={match.red} className={"bg-red-400 w-1/2"} />
              <Fighter fighter={match.blue} className={"bg-blue-400 w-1/2"} />
            </div>
          </div>
        ))}
    </>
  );
});

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
