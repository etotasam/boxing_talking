import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Axios } from "@/libs/axios";
//!types
import { MatchesType } from "@/libs/hooks/useMatches";
import { FighterType } from "@/libs/hooks/useFighter";

//!component
import { Chart } from "@/components/module/Chart";
import { Fighter } from "../Fighter";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { SpinnerModal } from "@/components/modal/SpinnerModal";

//! hooks
import { useMatchPredictVote, useFetchMatchPredictVote } from "@/libs/hooks/useMatchPredict";
// import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";
import { useFetchMatches } from "@/libs/hooks/useMatches";
// import { useFetchUserVote } from "@/libs/hooks/useFetchUserVote";
import dayjs from "dayjs";
import { useQueryState } from "@/libs/hooks/useQueryState";

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

  const { matchPredictVote, isLoading: isVoting } = useMatchPredictVote();

  //todo
  const { data: userVotes, isLoading: isFetchingVote } = useFetchMatchPredictVote();

  const [userVoteFighterColor, setUserVoteFighterColor] = useState<"red" | "blue">();
  useEffect(() => {
    if (!userVotes) return;
    const voteToThisMatch = userVotes.find((el) => el.match_id === matchId);
    if (!voteToThisMatch) return;
    setUserVoteFighterColor(voteToThisMatch.vote_for);
  }, [userVotes]);

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
    setOpenVoteConfirmModal(false);
    matchPredictVote({ matchId, vote: voteFighter.voteColor });
  };

  // const {setter: setOpenVoteConfirmModal} = useQueryState("q/openVoteConfirmModal", false)
  const [openVoteConfirmModal, setOpenVoteConfirmModal] = useState(false);
  const voteConfirm = () => {
    setOpenVoteConfirmModal(true);
  };

  const [mouseOnColor, setMouseOnColor] = React.useState<MouseOn>(MouseOn.NULL);

  //? chartのデータ
  const matchData = {
    labels: [thisMatch?.blue.name, thisMatch?.red.name],
    datasets: [
      {
        data: [thisMatch?.count_blue, thisMatch?.count_red],
        backgroundColor: [
          mouseOnColor === MouseOn.BLUE ? `rgb(30 64 175)` : `rgb(96 165 250)`,
          mouseOnColor === MouseOn.RED ? `rgb(185 28 28)` : `rgb(248 113 113)`,
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
          <div className="w-full flex justify-center">
            <div className="relative w-[80%]">
              <VoteButton
                match={thisMatch}
                userVoteColor={userVoteFighterColor}
                voteFighter={voteFighter}
                myVote={voteConfirm}
              />
              {isVoting && <SpinnerModal />}
              {isFetchingVote && (
                <div className="absolute top-0 left-0 w-full h-full text-white bg-stone-500 rounded px-2 py-1 text-center">
                  読み込み中...
                </div>
              )}
            </div>
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
      {openVoteConfirmModal && (
        <ConfirmModal
          execution={myVote}
          okBtnString={`投票する`}
          cancel={() => setOpenVoteConfirmModal(false)}
          message={`${voteFighter?.name}へ投票しますか <br /> ※投票後変更できません`}
        />
      )}
    </>
  );
};

type VoteButtonPropsType = {
  match: MatchesType | undefined;
  userVoteColor: "red" | "blue" | undefined;
  voteFighter: (FighterType & { voteColor: "red" | "blue" }) | undefined;
  myVote: () => void;
};

const VoteButton = ({ match, userVoteColor, voteFighter, myVote }: VoteButtonPropsType) => {
  return (
    <>
      {match && userVoteColor ? (
        <p
          className={`w-full rounded px-2 py-1 text-center text-stone-50 ${
            userVoteColor === "red" ? `bg-red-700` : `bg-blue-700`
          }`}
        >
          {`あなたの勝利予想: ${match[userVoteColor].name}`}
        </p>
      ) : voteFighter ? (
        <button
          className={`w-full text-white rounded px-2 py-1 duration-300 ${
            voteFighter.voteColor === "red"
              ? `text-red-600 border border-red-600 hover:bg-red-600 hover:text-stone-50`
              : `text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-stone-50`
          }`}
          onClick={myVote}
        >{`${voteFighter.name}の勝利に投票する`}</button>
      ) : (
        <div className="w-full text-stone-600 rounded px-2 py-1 border border-stone-600 text-center">
          勝者を予想しましょう
        </div>
      )}
    </>
  );
};
