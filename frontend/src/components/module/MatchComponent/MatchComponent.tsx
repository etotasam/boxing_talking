import React, { useState } from "react";
import dayjs from "dayjs";
import { MatchesType } from "@/libs/hooks/useMatches";
import { motion } from "framer-motion";
//! component
import { SimpleFighterComponent } from "@/components/module/SimpleFighterComponent";
import { useEffect } from "react";
//! hooks
import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";

type Props = {
  match: MatchesType;
  bgColorClassName?: string;
  onClick?: (matchId: number) => void;
};

export const MatchComponent = ({ match, bgColorClassName, onClick = () => null }: Props) => {
  enum MatchIs {
    TODAY = "text-red-600",
    PAST = "text-gray-400",
    FUTURE = "text-stone-600",
  }
  const { width: windowWidth } = useGetWindowSize();
  const bgColor = bgColorClassName ? bgColorClassName : `bg-white`;
  const matchDayStyle = (subjectDate: Date): MatchIs | undefined => {
    const today = dayjs().format("YYYY/MM/DD");
    const subDate = dayjs(subjectDate).format("YYYY/MM/DD");
    if (today === subDate) return MatchIs.TODAY;
    if (today > subDate) return MatchIs.PAST;
    if (today < subDate) return MatchIs.FUTURE;
  };

  const [ratioRed, setRatioRed] = useState<string>("");
  const [ratioBlue, setRatioBlue] = useState<string>("");
  useEffect(() => {
    if (!match) return;
    const { count_red, count_blue } = match;
    const totalVoteCount = count_red + count_blue;
    if (!totalVoteCount) {
      setRatioRed(`0%`);
      setRatioBlue(`0%`);
      return;
    }
    const red = (count_red / totalVoteCount) * 100;
    const blue = (count_blue / totalVoteCount) * 100;
    setRatioRed(`${Math.round(red)}%`);
    setRatioBlue(`${Math.round(blue)}%`);
  }, [match]);

  const variants = {
    initial: {
      width: "0%",
      opacity: 1,
    },
    redAnimate: {
      width: ratioRed,
      opacity: 1,
      backgroundColor: "#fb7185",
      transition: {
        duration: 1,
      },
    },
    blueAnimate: {
      width: ratioBlue,
      opacity: 1,
      backgroundColor: "#06b6d4",
      transition: {
        duration: 1,
      },
    },
  };

  return (
    <div
      // onClick={() => console.log("test")}
      key={match.id}
      className={`px-1 md:px-4 rounded-xl mt-5 first:mt-0 cursor-pointer drop-shadow-sm duration-300 ${bgColor}`}
    >
      {/* //? 試合日 */}
      <h1 className={`text-center font-thin text-lg pt-2 ${matchDayStyle(match.date as Date)}`}>
        {dayjs(match.date).format("YYYY/M/D")}
      </h1>
      {/* //? 勝利予想の比率 */}
      <div className="w-full px-2 sm:px-10">
        <div className="w-full flex justify-between text-sm font-thin select-none text-stone-600">
          <span>{ratioRed}</span>
          <span>{ratioBlue}</span>
        </div>
        <div className="flex justify-between w-full bg-stone-200 h-[2px]">
          <motion.span
            initial="initial"
            animate="redAnimate"
            variants={variants}
            className={`block h-[2px]`}
          />
          <motion.span
            initial="initial"
            animate="blueAnimate"
            variants={variants}
            className={`block h-[2px]`}
          />
        </div>
      </div>
      <div onClick={() => onClick(match.id)} className="flex">
        <SimpleFighterComponent fighter={match.red} cornerColor={"red"} className={"w-1/2"} />
        <SimpleFighterComponent fighter={match.blue} cornerColor={"blue"} className={"w-1/2"} />
      </div>
    </div>
  );
};
