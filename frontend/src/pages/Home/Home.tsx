import React, { useCallback, useEffect, useState } from "react";
import { Axios } from "@/libs/axios";
import { useNavigate } from "react-router-dom";
//! hooks
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useAuth } from "@/libs/hooks/useAuth";
import { useQueryState } from "@/libs/hooks/useQueryState";
//! components
import { LayoutDefault } from "@/layout/LayoutDefault";
import { MatchComponent } from "@/components/module/MatchComponent";
import { TestMatchComponent } from "@/components/module/TestMatchComponent";

export const Home = React.memo(() => {
  const navigate = useNavigate();
  const { data: authUser } = useAuth();
  const { data: matchesState, isError: isErrorOnFetchMatches } = useFetchMatches();

  const queue = useCallback(async () => {
    if (!authUser) return;
    const { data } = await Axios.put(`api/${authUser.id}/test`);
  }, [authUser]);

  const click = useCallback(
    (id: number) => {
      navigate(`/match?id=${id}`);
    },
    [authUser]
  );

  return (
    <>
      <div className="px-2 md:px-5 py-5">
        {isErrorOnFetchMatches && <MatchesFetchErrorComponent />}
        {matchesState &&
          matchesState.map((match) => (
            <TestMatchComponent
              key={match.id}
              onClick={(matchId: number) => click(matchId)}
              match={match}
            />
          ))}
      </div>
    </>
  );
});

const MatchesFetchErrorComponent = () => {
  return (
    <div className="flex flex-col items-center w-full py-5">
      <span>データの取得に失敗しました</span>
      <span>画面を更新してください</span>
    </div>
  );
};
