import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Axios } from "@/libs/axios";
//!types
import { MatchesType } from "@/libs/hooks/useMatches";
import { FighterType } from "@/libs/hooks/useFighter";

//!component
import { Chart } from "@/components/module/Chart";
import { Fighter } from "../Fighter";

//! hooks
import { useMatchPredictVote, useFetchMatchPredictVote } from "@/libs/hooks/useMatchPredict";
// import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";
import { useFetchMatches } from "@/libs/hooks/useMatches";
// import { useFetchUserVote } from "@/libs/hooks/useFetchUserVote";
import dayjs from "dayjs";

export enum MouseOn {
  RED = "red",
  BLUE = "blue",
  NULL = "null",
}

export const MatchInfo = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));
  const { data: matchesData } = useFetchMatches();
  const getThisMatch = (matches: MatchesType[], id: number): MatchesType | undefined => {
    return matches?.find((match) => match.id === id);
  };
  const [thisMatch, setThisMatch] = React.useState<MatchesType>();

  const { matchPredictVote } = useMatchPredictVote();

  //todo
  const { data: userVote } = useFetchMatchPredictVote();
  const [userVoteFighterColor, setUserVoteFighterColor] = useState<"red" | "blue">();
  useEffect(() => {
    if (!userVote) return;
    const voteState = userVote.find((el) => el.match_id === matchId);
    if (!voteState) return;
    setUserVoteFighterColor(voteState.vote_for);
  }, [userVote]);

  //? 投票先(forontend側)
  const [voteIs, setVoteIs] = React.useState<"red" | "blue" | undefined>();

  //? 試合のデータを取得
  React.useEffect(() => {
    if (!matchesData) return;
    const match = getThisMatch(matchesData, matchId);
    setThisMatch(match);
    if (!match) return;
  }, [matchesData]);

  const [voteFighter, setVoteFighter] = useState<FighterType & { voteColor: "red" | "blue" }>();
  //? 投票先をstateにセット&フロント側だけで表示を反映
  const voteToFighter = async (vote: "red" | "blue", fighter: FighterType) => {
    if (userVoteFighterColor) return;
    setVoteFighter({ ...fighter, voteColor: vote });
    let tempGameData: MatchesType = { ...thisMatch! };
    if (vote === "red" && voteIs !== "red") {
      tempGameData.count_red += 1;
      if (voteIs === "blue") {
        tempGameData.count_blue -= 1;
      }
      setVoteIs("red");
    }
    if (vote === "blue" && voteIs !== "blue") {
      tempGameData.count_blue += 1;
      if (voteIs === "red") {
        tempGameData.count_red -= 1;
      }
      setVoteIs("blue");
    }
    setThisMatch(tempGameData);
  };

  //? 投票API
  const myVote = () => {
    if (!voteFighter) return;
    matchPredictVote({ matchId, vote: voteFighter.voteColor });
  };

  const [mouseOnColor, setMouseOnColor] = React.useState<MouseOn>(MouseOn.NULL);

  //? chartのデータ
  const matchData = {
    labels: [thisMatch?.blue.name, thisMatch?.red.name],
    datasets: [
      {
        data: [thisMatch?.count_blue, thisMatch?.count_red],
        backgroundColor: [
          mouseOnColor === MouseOn.BLUE ? `rgb(30 64 175)` : `rgb(147 197 253)`,
          mouseOnColor === MouseOn.RED ? `rgb(185 28 28)` : `rgb(254 202 202)`,
        ],
        // borderColor: [
        //   mouseOnColor === MouseOn.BLUE ? `#d6d5ff` : `#717ffd`,
        //   mouseOnColor === MouseOn.RED ? `#ffe0e0` : `#ff6868`,
        // ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <>
      <div className="grid grid-cols-5 grid-rows-1 border-b py-3 border-stone-400">
        <div className="col-span-3 row-span-1">
          {matchData && (
            <Chart
              // className="col-span-3 row-span-1"
              setMouseOnColor={(color: MouseOn) => setMouseOnColor(color)}
              matchData={matchData}
            />
          )}
          <div className="w-full px-10">
            {thisMatch && userVoteFighterColor ? (
              `${
                (thisMatch[userVoteFighterColor as keyof MatchesType] as FighterType).name
              }に投票済み`
            ) : voteFighter ? (
              <button
                className={`w-full text-white rounded px-2 py-1 ${
                  voteFighter.voteColor === "red" ? `bg-red-500` : `bg-blue-500`
                }`}
                onClick={myVote}
              >{`${voteFighter.name}に投票する`}</button>
            ) : (
              <div className="w-full text-white rounded px-2 py-1 bg-stone-700 text-center">
                投票する選手を選択
              </div>
            )}
          </div>
        </div>
        {thisMatch && (
          <div className="col-span-2 row-span-1 grid grid-rows-[1fr_30px_1fr]">
            <h1 className="col-span-1 row-span-1 row-start-2 bg-stone-800 text-center text-white text-xl">
              {dayjs(thisMatch.date).format("YYYY/M/D")}
            </h1>
            <div
              className={`w-full col-span-1 row-span-1 flex items-center cursor-pointer duration-500 ${
                mouseOnColor === MouseOn.RED ? `bg-red-700` : `bg-stone-800`
              }`}
              onClick={() => voteToFighter("red", thisMatch.red)}
              onMouseOver={() => setMouseOnColor(MouseOn.RED)}
              onMouseOut={() => setMouseOnColor(MouseOn.NULL)}
            >
              <Fighter
                fighter={thisMatch.red}
                recordTextColor={`text-gray-200`}
                className={`w-full text-gray-200`}
              />
            </div>
            <div
              className={`w-full col-span-1 row-span-1 flex items-center cursor-pointer duration-500 ${
                mouseOnColor === MouseOn.BLUE ? `bg-blue-800` : `bg-stone-800`
              }`}
              onClick={() => voteToFighter("blue", thisMatch.blue)}
              onMouseOver={() => setMouseOnColor(MouseOn.BLUE)}
              onMouseOut={() => setMouseOnColor(MouseOn.NULL)}
            >
              <Fighter
                fighter={thisMatch.blue}
                recordTextColor={`text-gray-200`}
                className={`w-full text-gray-200`}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
