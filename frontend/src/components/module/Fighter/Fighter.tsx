import React from "react";
import dayjs from "dayjs";
import { FighterType } from "@/libs/types/fighter";
import { Stance, Nationality } from "@/libs/types/fighter";

type FighterProps = {
  fighter: FighterType;
  className?: string;
  cornerColor?: "red" | "blue";
};

enum NationaFlag {
  Japan = "t-flag-jp",
  Mexico = "t-flag-mx",
  USA = "t-flag-us",
  Kazakhstan = "t-flag-kz",
  UK = "t-flag-uk",
  Rusia = "t-flag-ru",
  Philpin = "t-flag-ph",
}

export const Fighter = ({ fighter, className, cornerColor }: FighterProps) => {
  const today = dayjs();
  const birthday = fighter.birth;
  const age = today.diff(birthday, "year");

  const boxingStyle = React.useCallback((stance: Stance) => {
    switch (stance) {
      case Stance.Southpaw:
        return "サウスポー";
      case Stance.Orthodox:
        return "オーソドックス";
    }
  }, []);
  const stance = boxingStyle(fighter.stance);

  const checkNationality = React.useCallback((countory: string) => {
    switch (countory) {
      case Nationality.Japan:
        return NationaFlag.Japan;
      case Nationality.Mexico:
        return NationaFlag.Mexico;
      case Nationality.USA:
        return NationaFlag.USA;
      case Nationality.Kazakhstan:
        return NationaFlag.Kazakhstan;
      case Nationality.UK:
        return NationaFlag.UK;
      case Nationality.Rusia:
        return NationaFlag.Rusia;
      case Nationality.Philpin:
        return NationaFlag.Philpin;
    }
  }, []);
  const nationalFlag = checkNationality(fighter.country!);
  return (
    <div className={`flex p-3 ${cornerColor === "red" && `flex-row-reverse`} ${className}`}>
      {fighter && (
        <>
          <div className="flex flex-col w-1/2">
            <div className={`flex justify-center items-center ${cornerColor === "red" && `flex-row-reverse`}`}>
              <span className={`${nationalFlag} t-flag w-[25px] h-full`}></span>
              <p className="p-2">{fighter.name}</p>
            </div>
            <p className="text-center">{age}才</p>
            <p className="text-center">身長: {fighter.height}cm</p>
            <p className="text-center">{stance}</p>
          </div>

          <div className="w-1/2">
            <div className="flex">
              <div className="flex-1 text-stone-500 text-xs text-center">WIN</div>
              <div className="flex-1 text-stone-500 text-xs text-center">DRWA</div>
              <div className="flex-1 text-stone-500 text-xs text-center">LOSE</div>
            </div>
            <div className="flex">
              <div className="flex-1 py-1 text-white text-center bg-green-500">{`${fighter.win}`}</div>
              <div className="flex-1 py-1 text-white text-center bg-stone-400">{fighter.draw}</div>
              <div className="flex-1 py-1 text-white text-center bg-stone-800">{fighter.lose}</div>
            </div>
            <div className="w-1/3 text-stone-500 text-center text-xs">{`${fighter.ko} KO`}</div>
          </div>
        </>
      )}
    </div>
  );
};
