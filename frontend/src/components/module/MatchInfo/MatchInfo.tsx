import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

//types
import { MatchesType } from "@/libs/apis/matchAPI";
import { FighterType } from "@/libs/hooks/fetchers";

//component
import { TestChart } from "@/components/module/Chart";
import { FighterChart } from "@/components/module/FighterChart";
import { RiBoxingFill } from "react-icons/ri";
import { Fighter } from "../Fighter";

//hooks
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";
import { useFetchUserVote } from "@/libs/hooks/useFetchUserVote";
import { useFetchFighters } from "@/libs/hooks/useFetchFighters";
import { useResizeCommentsComponent } from "@/libs/hooks/useResizeCommentsComponent";
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
  const { matchesState } = useFetchAllMatches();
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

  //ユーザが勝敗を予想した試合
  const { userVoteState } = useFetchUserVote();

  //ユーザがこの試合の勝敗予測をした、また、そのデータ
  const getUsersVoteThisMatchById = (matchId: number) => {
    if (!userVoteState.votes) return;
    return userVoteState.votes.find((el) => el.match_id === matchId);
  };

  //投票先(forontend側)
  const [voteIs, setVoteIs] = React.useState<"red" | "blue" | undefined>();

  // 試合のデータを取得
  React.useEffect(() => {
    if (matchesState.matches === undefined) return;
    const match = getThisMatch(matchesState.matches, matchId);
    setThisMatch(match);
    if (!match) return;
    const userVoteData = getUsersVoteThisMatchById(match.id);
    setVoteIs(userVoteData?.vote_for);
  }, [matchesState.matches]);

  // 投票
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

  // chartのデータ
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

  // elementRefを親に送る
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
      {/* <div> */}
      <div ref={chartRef} className="grid grid-cols-5 grid-rows-1">
        <TestChart
          className="col-span-3 row-span-1"
          setMouseOnColor={(color: MouseOn) => setMouseOnColor(color)}
          matchData={matchData}
        />
        {/* <div className="col-span-1 row-span-1 py-10">
          <FighterChart setMouseOnColor={(color: MouseOn) => setMouseOnColor(color)} fighterData={selectFighter} />
        </div> */}
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
      {/* </div> */}
      {/* 試合情報 */}
      {/* {thisMatch && (
        <div ref={matchesRef} className="w-full">
          <h1 className="bg-gray-600 text-white">{thisMatch.date}</h1>
          <ul className="flex w-full">
            <li
              className="w-1/2"
              onClick={() => clickFighter({ fighter: thisMatch.red, color: "red" })}
              onMouseOver={() => setMouseOnColor(MouseOn.RED)}
              onMouseOut={() => setMouseOnColor(MouseOn.NULL)}
            >
              <Fighter fighter={thisMatch.red} className="bg-stone-100 w-full cursor-pointer" cornerColor="red" />
            </li>
            <li
              className="w-1/2"
              onClick={() => clickFighter({ fighter: thisMatch.blue, color: "blue" })}
              onMouseOver={() => setMouseOnColor(MouseOn.BLUE)}
              onMouseOut={() => setMouseOnColor(MouseOn.NULL)}
            >
              <Fighter fighter={thisMatch.blue} className="bg-stone-100 w-full cursor-pointer" />
            </li>
          </ul>
        </div>
      )} */}
    </>
  );
};

type FighterComponentProps = {
  fighter: FighterType;
  className: string;
  voteColor: "red" | "blue" | undefined;
  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut: () => void;
  voteCount: number;
  color: "red" | "blue";
};

const FighterComponent = ({
  fighter,
  className,
  onClick,
  voteCount,
  voteColor,
  color,
  onMouseOver,
  onMouseOut,
}: FighterComponentProps) => {
  return (
    <div
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      className={`w-1/2 cursor-pointer ${className}`}
    >
      <div className={"h-[30px] flex justify-center items-center"}>
        {voteColor === color && <RiBoxingFill className={"text-white text-2xl"} />}
      </div>
      <h2>
        {fighter.name} 投票数: {voteCount}
      </h2>
      <p>{fighter.country}</p>
      <p>{`${fighter.win}勝 ${fighter.draw}分 ${fighter.lose}敗 ${fighter.ko}KO`}</p>
    </div>
  );
};
