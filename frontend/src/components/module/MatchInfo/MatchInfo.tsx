import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { NationaFlag, checkNationality } from "@/components/module/Fighter";
import { useQueryClient } from "react-query";
import { queryKeys } from "@/libs/queryKeys";
import dayjs from "dayjs";
import { WINDOW_WIDTH } from "@/libs/utils";
//!types
import { MatchesType } from "@/libs/hooks/useMatches";
import { FighterType } from "@/libs/hooks/useFighter";
import type { UserType } from "@/types/user";
//!component
import { Chart } from "@/components/module/Chart";
import { SimpleFighterComponent } from "../SimpleFighterComponent";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { Spinner } from "@/components/module/Spinner";
//! hooks
import { useMatchPredictVote, useFetchMatchPredictVote } from "@/libs/hooks/useMatchPredict";
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";
//! message
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";

export enum MouseOn {
  RED = "red",
  BLUE = "blue",
  NULL = "null",
}

export const MatchInfo = () => {
  const queryClient = useQueryClient();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));
  const { data: matchesData } = useFetchMatches();
  const getThisMatch = (matches: MatchesType[], id: number): MatchesType | undefined => {
    return matches?.find((match) => match.id === id);
  };
  const [thisMatch, setThisMatch] = React.useState<MatchesType>();

  const { matchPredictVote } = useMatchPredictVote();

  const { data: userVotes } = useFetchMatchPredictVote();

  const [userVoteFighterColor, setUserVoteFighterColor] = useState<"red" | "blue">();
  useEffect(() => {
    if (!userVotes) return;
    //? この試合のユーザーの投票結果を取得
    const votedResultOnThisMatch = userVotes.find((el) => el.match_id === matchId);
    if (votedResultOnThisMatch) {
      setUserVoteFighterColor(votedResultOnThisMatch.vote_for);
    } else {
      setUserVoteFighterColor(undefined);
    }
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
    //? 試合当日以降は投票できないようにする
    if (thisMatch) {
      const nowDate = dayjs().unix();
      const matchDate = dayjs(thisMatch.date).unix();
      if (nowDate >= matchDate) return;
    }
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

  const { setToastModalMessage } = useToastModal();
  //? 投票API
  const myVote = () => {
    if (!voteFighter) return;
    setOpenVoteConfirmModal(false);

    matchPredictVote({ matchId, vote: voteFighter.voteColor });
  };

  // const {setter: setOpenVoteConfirmModal} = useQueryState("q/openVoteConfirmModal", false)
  const [openVoteConfirmModal, setOpenVoteConfirmModal] = useState(false);
  const voteConfirm = () => {
    //? ログインしてない場合は拒否
    const auth = queryClient.getQueryData<UserType>(queryKeys.auth);
    if (!auth) {
      setToastModalMessage({
        message: MESSAGE.VOTE_FAILED_WITH_NO_AUTH,
        bgColor: ModalBgColorType.NOTICE,
      });
      return;
    }
    setOpenVoteConfirmModal(true);
  };

  const [mouseOnColor, setMouseOnColor] = React.useState<MouseOn>(MouseOn.NULL);

  //? chartのデータ
  const matchData = {
    labels: [thisMatch?.blue.name, thisMatch?.red.name],
    datasets: [
      {
        labels: [thisMatch?.blue.name, thisMatch?.red.name],
        data: [thisMatch?.count_blue, thisMatch?.count_red],
        backgroundColor: [
          mouseOnColor === MouseOn.BLUE ? `#0284c7` : `#38bdf8`,
          mouseOnColor === MouseOn.RED ? `#e11d48` : `#fb7185`,
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
      <h1 className="text-center text-stone-600 font-thin text-xl">
        {thisMatch && dayjs(thisMatch.date).format("YYYY/M/D")}
      </h1>
      <div className="pt-3 md:flex md:px-5 lg:flex-col lg:px-0">
        <div className="px-5 flex justify-center items-center">
          {matchData && (
            <Chart
              // className="col-span-3 row-span-1"
              setMouseOnColor={(color: MouseOn) => setMouseOnColor(color)}
              matchData={matchData}
            />
          )}
        </div>
        {thisMatch && (
          <FightersInfo
            myVote={voteConfirm}
            userVoteColor={userVoteFighterColor}
            voteFighter={voteFighter}
            thisMatch={thisMatch}
            mouseOnColor={mouseOnColor}
            setMouseOnColor={(color) => setMouseOnColor(color)}
            voteToFighter={(vote, fighter) => voteToFighter(vote, fighter)}
          />
        )}
      </div>
      {openVoteConfirmModal && (
        <ConfirmModal
          execution={myVote}
          okBtnString={`投票する`}
          cancel={() => setOpenVoteConfirmModal(false)}
          message={<Message fighter={voteFighter} />}
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
  const { isLoading: isFetchingVote, isRefetching: isRefetchingVote } = useFetchMatchPredictVote();
  const { isLoading: isVoting } = useMatchPredictVote();
  return (
    <div className="relative w-full">
      {match && userVoteColor ? (
        <p
          className={`w-full rounded-lg px-2 py-1 text-center text-stone-50 ${
            userVoteColor === "red" ? `bg-red-700` : `bg-blue-700`
          }`}
        >
          {`${match[userVoteColor].name}の勝利に投票済`}
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
          勝敗未投票
        </div>
      )}
      {isVoting && <Spinner />}
      {(isFetchingVote || isRefetchingVote) && (
        <div className="absolute top-0 left-0 w-full h-full text-white bg-stone-500 rounded px-2 py-1 text-center">
          読み込み中...
        </div>
      )}
    </div>
  );
};

type MessagePropsType = {
  fighter: FighterType | undefined;
};

const Message = ({ fighter }: MessagePropsType) => {
  const [flag, setFlag] = useState<NationaFlag | undefined>();
  useEffect(() => {
    if (!fighter) return;
    setFlag(checkNationality(fighter.country!));
  }, [fighter]);
  return (
    <div className="w-full flex justify-center">
      <div className={`${flag} t-flag mr-2 w-[25px] h-[25px]`}></div>
      <p className="">{`${fighter?.name}に投票しますか？`}</p>
    </div>
  );
};

type FighterInfoPropsType = {
  thisMatch: MatchesType;
  mouseOnColor: MouseOn;
  setMouseOnColor: (color: MouseOn) => void;
  voteToFighter: (vote: "red" | "blue", fighter: FighterType) => void;
  myVote: () => void;
  userVoteColor: "red" | "blue" | undefined;
  voteFighter: (FighterType & { voteColor: "red" | "blue" }) | undefined;
};

const FightersInfo = (props: FighterInfoPropsType) => {
  const { width: windowWidth } = useGetWindowSize();
  return (
    <div className="mt-3 sm:m-0 md:p-0 w-full flex items-center px-4">
      <div className="w-full grid grid-rows-[32px_1fr] grid-cols-[1fr_1fr] md:grid-rows-[1fr_32px_1fr] md:grid-cols-[1fr] lg:grid-rows-[32px_1fr] lg:grid-cols-[1fr_1fr]">
        {/* //? 投票ボタン */}
        <div className="col-span-2 md:row-start-2 lg:row-start-1">
          <VoteButton
            match={props.thisMatch}
            userVoteColor={props.userVoteColor}
            voteFighter={props.voteFighter}
            myVote={props.myVote}
          />
        </div>

        <div className={`w-full flex items-center py-2 col-span-1 md:row-start-1 lg:row-start-2`}>
          <div
            onClick={() => props.voteToFighter("red", props.thisMatch.red)}
            onMouseOver={() => props.setMouseOnColor(MouseOn.RED)}
            onMouseOut={() => props.setMouseOnColor(MouseOn.NULL)}
            className={`w-full h-full rounded-l-xl md:rounded-xl lg:rounded-r-none cursor-pointer duration-500 ${
              props.mouseOnColor === MouseOn.RED ? `bg-red-700` : `bg-stone-800`
            }`}
          >
            <SimpleFighterComponent
              fighter={props.thisMatch.red}
              recordTextColor={`text-gray-200`}
              className={`w-full text-gray-200`}
              cornerColor={windowWidth < WINDOW_WIDTH.md ? "red" : undefined}
            />
          </div>
        </div>

        <div className={`w-full flex items-center py-2 col-span-1 md:row-start-3 lg:row-start-2`}>
          <div
            onClick={() => props.voteToFighter("blue", props.thisMatch.blue)}
            onMouseOver={() => props.setMouseOnColor(MouseOn.BLUE)}
            onMouseOut={() => props.setMouseOnColor(MouseOn.NULL)}
            className={`w-full h-full rounded-r-xl md:rounded-xl lg:rounded-l-none cursor-pointer duration-500 ${
              props.mouseOnColor === MouseOn.BLUE ? `bg-blue-800` : `bg-stone-800`
            }`}
          >
            <SimpleFighterComponent
              fighter={props.thisMatch.blue}
              recordTextColor={`text-gray-200`}
              className={`w-full text-gray-200`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
