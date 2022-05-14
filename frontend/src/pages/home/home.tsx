import React, { useCallback, useEffect, useState } from "react";
import { Axios } from "@/libs/axios";
import { useNavigate } from "react-router-dom";

//! hooks
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useAuth } from "@/libs/hooks/useAuth";

//! components
import { LayoutDefault } from "@/layout/LayoutDefault";
import { MatchComponent } from "@/components/module/MatchComponent";

//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";

export const Home = React.memo(() => {
  const navigate = useNavigate();
  const { data: authUser } = useAuth();
  const { data: matchesState, isError: isErrorOnFetchMatches } = useFetchMatches();

  const queue = useCallback(async () => {
    if (!authUser) return;
    const { data } = await Axios.put(`api/${authUser.id}/test`);
    console.log(data);
  }, [authUser]);

  const { setToastModalMessage } = useToastModal();
  const click = useCallback(
    (id: number) => {
      if (!authUser) {
        setToastModalMessage({ message: MESSAGE.NOT_AUTHORIZED, bgColor: ModalBgColorType.ERROR });
        return;
      }
      navigate(`/match?id=${id}`);
    },
    [authUser]
  );

  return (
    <LayoutDefault>
      <div className={`w-2/3 my-5 ml-5 rounded-md pb-3 bg-stone-50`}>
        <h1 className="rounded-t-md bg-stone-800 text-white text-2xl p-2">SCHEDULE</h1>
        {isErrorOnFetchMatches && <MatchesFetchErrorComponent />}
        {matchesState &&
          matchesState.map((match) => (
            <MatchComponent
              key={match.id}
              onClick={(matchId: number) => click(matchId)}
              match={match}
            />
          ))}
      </div>
    </LayoutDefault>
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
