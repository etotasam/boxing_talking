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

  //? 削除対象の試合
  const [odlMatches, setOldMatches] = useState<MatchesType[]>([]);
  //? 過去の試合
  const [pastMatches, setPastMatches] = useState<MatchesType[]>([]);
  //? 先の試合
  const [scheduledMatches, setScheduledMatches] = useState<MatchesType[]>([]);
  //? 過去の試合を選別
  const isPastMatch = (matchDate: Date | string) => {
    return dayjs(matchDate as string).isBefore(dayjs());
  };
  //? 試合後２週間以上経過した試合（表示させない試合 and データベースから消す対象）
  const isOldMatch = (matchDate: Date | string) => {
    return dayjs(matchDate as string).isBefore(dayjs().subtract(2, "week").toDate());
  };

  //? 取得した試合データが過去か先かの振り分け
  useEffect(() => {
    if (!matchesState) return;
    //? 試合情報をリセット
    setOldMatches([]);
    setPastMatches([]);
    setScheduledMatches([]);

    matchesState.forEach((match) => {
      //?削除対象の試合かどうか
      if (isOldMatch(match.date)) {
        setOldMatches((curr) => {
          return [...curr, match];
        });
        return;
      }
      //?終了した試合かどうか
      if (isPastMatch(match.date)) {
        setPastMatches((curr) => {
          return [...curr, match];
        });
        return;
      }
      //?明日以降の試合かどうか
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
        {/* //? エラーの時はエラー用のコンポーネントを表示させる */}
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
        {/* //? 削除対象の試合  */}
        {!!odlMatches.length && (
          <>
            {odlMatches.map((match) => (
              <MatchComponent
                key={match.id}
                bgColorClassName={`bg-red-200`}
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
