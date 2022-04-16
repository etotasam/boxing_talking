import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

//types
import { MatchesType, FighterType } from "@/libs/apis/fetchMatchesAPI";

//component
import { TestChart } from "@/components/chart";
import { RiBoxingFill } from "react-icons/ri";

//hooks
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";
import { useFetchVoteResult } from "@/libs/hooks/useFetchVoteResult";
import { useResizeCommentsComponent } from "@/libs/hooks/useResizeCommentsComponent";

type Props = {
  getElRefArray: (arr: any[]) => void;
};

export const MatchInfo = ({ getElRefArray }: Props) => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));
  const { matchesState } = useFetchAllMatches();
  const getThisMatch = (matches: MatchesType[], id: number): MatchesType | undefined => {
    return matches?.find((match) => match.id === id);
  };
  const [thisMatch, setThisMatch] = React.useState<MatchesType>();

  //ユーザが勝敗を予想した試合
  const { voteResultState } = useFetchVoteResult();

  //ユーザがこの試合の勝敗予測をした、また、そのデータ
  const getUsersVoteThisMatchById = (matchId: number) => {
    if (!voteResultState.votes) return;
    return voteResultState.votes.find((el) => el.match_id === matchId);
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

  enum MouseOn {
    RED = "red",
    BLUE = "blue",
    NULL = "null",
  }

  const [whichIsMouseOn, setWhichIsMouseOn] = React.useState<MouseOn>(MouseOn.NULL);
  const [chartColor, setChartColor] = React.useState();

  // chartのデータ
  const matchData = {
    labels: [thisMatch?.blue.name, thisMatch?.red.name],
    datasets: [
      {
        data: [thisMatch?.count_blue, thisMatch?.count_red],
        backgroundColor: [
          whichIsMouseOn === MouseOn.BLUE ? `rgb(59 130 246)` : `rgb(96 165 250)`,
          whichIsMouseOn === MouseOn.RED ? `rgb(239 68 68)` : `rgb(248 113 113)`,
        ],
        borderWidth: 1,
      },
    ],
  };

  // elementRefを親に送る
  const matchesRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    getElRefArray([matchesRef, chartRef]);
  }, []);

  return (
    <>
      {/* <div> */}
      <div ref={chartRef} className="flex justify-center items-center bg-green-600">
        <div className="max-w-[600px] min-w-[400px] bg-green-200">
          <TestChart matchData={matchData} />
        </div>
      </div>
      {/* </div> */}
      {/* 試合情報 */}
      {thisMatch && (
        <div ref={matchesRef} className="w-full">
          <h1 className="bg-gray-600 text-white">{thisMatch.date}</h1>
          <div className="flex">
            <FighterComponent
              fighter={thisMatch.red}
              voteCount={thisMatch.count_red}
              voteColor={voteIs}
              onClick={() => voteToFighter("red")}
              onMouseOver={() => setWhichIsMouseOn(MouseOn.RED)}
              onMouseOut={() => setWhichIsMouseOn(MouseOn.NULL)}
              color={"red"}
              className={"bg-red-400 hover:bg-red-500 duration-500"}
            />
            <FighterComponent
              fighter={thisMatch.blue}
              voteCount={thisMatch.count_blue}
              voteColor={voteIs}
              onClick={() => voteToFighter("blue")}
              onMouseOver={() => setWhichIsMouseOn(MouseOn.BLUE)}
              onMouseOut={() => setWhichIsMouseOn(MouseOn.NULL)}
              color={"blue"}
              className={"bg-blue-400 hover:bg-blue-500 duration-500"}
            />
          </div>
        </div>
      )}
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
