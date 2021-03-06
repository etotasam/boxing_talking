import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

//types
import { MatchesType } from "@/libs/apis/matchAPI";
import { FighterType } from "@/libs/hooks/fetchers";

//component
import { TestChart } from "@/components/module/Chart";
import { Fighter } from "../Fighter";

//! hooks
// import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useFetchUserVote } from "@/libs/hooks/useFetchUserVote";
import dayjs from "dayjs";

type Props = {
  getElRefArray: (arr: any[]) => void;
};

export enum MouseOn {
  RED = "red",
  BLUE = "blue",
  NULL = "null",
}

export const MatchInfo = ({ getElRefArray }: Props) => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));
  // const { matchesState } = useFetchAllMatches();
  const { data: matchesData } = useFetchMatches();
  const getThisMatch = (matches: MatchesType[], id: number): MatchesType | undefined => {
    return matches?.find((match) => match.id === id);
  };
  const [thisMatch, setThisMatch] = React.useState<MatchesType>();

  //? 選手データ
  // const {fightersState} = useFetchFighters()
  const [selectFighter, setSelectFighter] = useState<FighterType>();

  const clickFighter = ({ fighter, color }: { fighter: FighterType; color: "red" | "blue" }) => {
    voteToFighter(color);
    setSelectFighter(fighter);
  };

  //? ユーザが勝敗を予想した試合
  const { userVoteState } = useFetchUserVote();

  //? ユーザがこの試合の勝敗予測をした、また、そのデータ
  const getUsersVoteThisMatchById = (matchId: number) => {
    if (!userVoteState.votes) return;
    return userVoteState.votes.find((el) => el.match_id === matchId);
  };

  //? 投票先(forontend側)
  const [voteIs, setVoteIs] = React.useState<"red" | "blue" | undefined>();

  //? 試合のデータを取得
  React.useEffect(() => {
    if (!matchesData) return;
    const match = getThisMatch(matchesData, matchId);
    setThisMatch(match);
    if (!match) return;
    const userVoteData = getUsersVoteThisMatchById(match.id);
    setVoteIs(userVoteData?.vote_for);
  }, [matchesData]);

  //? 投票
  const voteToFighter = async (vote: "red" | "blue") => {
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

  const [mouseOnColor, setMouseOnColor] = React.useState<MouseOn>(MouseOn.NULL);

  //? chartのデータ
  const matchData = {
    labels: [thisMatch?.blue.name, thisMatch?.red.name],
    datasets: [
      {
        data: [thisMatch?.count_blue, thisMatch?.count_red],
        backgroundColor: [
          mouseOnColor === MouseOn.BLUE ? `rgb(96 165 250)` : `#6c6c6c`,
          mouseOnColor === MouseOn.RED ? `rgb(248 113 113)` : `#b1b1b1`,
        ],
        // borderColor: [
        //   mouseOnColor === MouseOn.BLUE ? `#d6d5ff` : `#717ffd`,
        //   mouseOnColor === MouseOn.RED ? `#ffe0e0` : `#ff6868`,
        // ],
        borderWidth: 0,
      },
    ],
  };
  // chartのデータ
  const fighterData = {
    labels: [thisMatch?.blue.name, thisMatch?.red.name],
    datasets: [
      {
        data: [thisMatch?.count_blue, thisMatch?.count_red],
        backgroundColor: [
          mouseOnColor === MouseOn.BLUE ? `rgb(96 165 250)` : `rgb(191 219 254)`,
          mouseOnColor === MouseOn.RED ? `rgb(248 113 113)` : `rgb(254 202 202)`,
        ],
        // borderColor: [
        //   mouseOnColor === MouseOn.BLUE ? `#d6d5ff` : `#717ffd`,
        //   mouseOnColor === MouseOn.RED ? `#ffe0e0` : `#ff6868`,
        // ],
        borderWidth: 1,
      },
    ],
  };

  //? elementRefを親に送る
  const matchesRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    getElRefArray([chartRef]);
  }, []);

  const test = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // if (mouseOnColor === MouseOn.BLUE) return;
    // e.stopPropagation();
    setMouseOnColor(MouseOn.BLUE);
  };

  return (
    <>
      <div ref={chartRef} className="grid grid-cols-5 grid-rows-1">
        <TestChart
          className="col-span-3 row-span-1"
          setMouseOnColor={(color: MouseOn) => setMouseOnColor(color)}
          matchData={matchData}
        />
        {thisMatch && (
          <div className="col-span-2 row-span-1 grid grid-rows-[1fr_30px_1fr] bg-green-300">
            <h1 className="col-span-1 row-span-1 row-start-2 bg-gray-600 text-center text-white text-xl">
              {dayjs(thisMatch.date).format("YYYY/M/D")}
            </h1>
            <div
              className={`w-full col-span-1 row-span-1 flex items-center cursor-pointer ${
                mouseOnColor === MouseOn.RED ? `bg-red-400` : `bg-stone-200`
              } duration-500`}
              onClick={() => voteToFighter("red")}
              onMouseOver={() => setMouseOnColor(MouseOn.RED)}
              onMouseOut={() => setMouseOnColor(MouseOn.NULL)}
            >
              <Fighter fighter={thisMatch.red} className={`w-full`} />
            </div>
            <div
              className={`w-full col-span-1 row-span-1 flex items-center cursor-pointer ${
                mouseOnColor === MouseOn.BLUE ? `bg-blue-400` : `bg-stone-200`
              } duration-500`}
              onClick={() => voteToFighter("blue")}
              onMouseOver={() => setMouseOnColor(MouseOn.BLUE)}
              onMouseOut={() => setMouseOnColor(MouseOn.NULL)}
            >
              <Fighter fighter={thisMatch.blue} className={`w-full`} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
