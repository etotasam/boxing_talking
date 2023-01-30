import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//! hooks
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useAuth } from "@/libs/hooks/useAuth";
//! components
import { MatchComponent } from "@/components/module/MatchComponent";
import dayjs from "dayjs";
//! type
import { MatchesType } from "@/libs/types";

export const Home = () => {
  const navigate = useNavigate();
  const { data: authUser } = useAuth();
  const { data: matchesState, isError: isErrorOnFetchMatches } = useFetchMatches();

  //? 過去の試合
  const [pastMatches, setPastMatches] = useState<MatchesType[]>([]);
  //? 先の試合
  const [scheduledMatches, setScheduledMatches] = useState<MatchesType[]>([]);
  const isPastMatch = (matchDate: Date | string) => {
    return dayjs(matchDate as string).isBefore(dayjs());
  };
  //? 取得した試合データが過去か先かの振り分け
  useEffect(() => {
    if (!matchesState) return;
    setPastMatches([]);
    setScheduledMatches([]);
    matchesState.forEach((match) => {
      if (isPastMatch(match.date)) {
        setPastMatches((curr) => {
          return [...curr, match];
        });
      }
      if (!isPastMatch(match.date)) {
        setScheduledMatches((curr) => {
          return [...curr, match];
        });
      }
    });
  }, [matchesState]);

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
        {/* //? 予定された試合  */}
        {!!scheduledMatches.length &&
          scheduledMatches.map((match) => (
            <MatchComponent
              key={match.id}
              onClick={(matchId: number) => click(matchId)}
              match={match}
            />
          ))}

        {/* //? 終了した試合  */}
        {!!pastMatches.length && (
          <>
            <hr className="my-4 h-[2px] bg-stone-500" />
            {pastMatches.map((match) => (
              <MatchComponent
                key={match.id}
                bgColorClassName={`bg-black/10`}
                onClick={(matchId: number) => click(matchId)}
                match={match}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
};

const MatchesFetchErrorComponent = () => {
  return (
    <div className="flex flex-col items-center w-full py-5">
      <span>データの取得に失敗しました</span>
      <span>画面を更新してください</span>
    </div>
  );
};
