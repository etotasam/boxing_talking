import React from "react";
import dayjs from "dayjs";
import { FighterType, Nationality } from "@/libs/hooks/useFighter";
//! hooks
import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";

type FighterProps = {
  fighter: FighterType;
  className?: string;
  recordTextColor?: string;
  cornerColor?: "red" | "blue" | `undefined`;
};

export enum NationaFlag {
  Japan = "t-flag-jp",
  Mexico = "t-flag-mx",
  USA = "t-flag-us",
  Kazakhstan = "t-flag-kz",
  UK = "t-flag-uk",
  Rusia = "t-flag-ru",
  Philpin = "t-flag-ph",
  Ukrine = "t-flag-ua",
}

export const checkNationality = (countory: string) => {
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
    case Nationality.Ukrine:
      return NationaFlag.Ukrine;
  }
};

export const SimpleFighterComponent = React.memo(
  ({ fighter, className, cornerColor, recordTextColor }: FighterProps) => {
    const nationalFlag = checkNationality(fighter.country!);
    const textColor = recordTextColor ? recordTextColor : `text-stone-500`;
    return (
      <div className={`flex flex-col py-2 px-2 sm:px-10 ${className}`}>
        {fighter && (
          <>
            {/* name */}
            <div
              className={`flex justify-center items-center ${
                cornerColor === "red" ? `flex-row-reverse` : ``
              }`}
            >
              <span
                className={`${nationalFlag} block w-[25px] h-[20px]`}
                style={{
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              ></span>
              <p className="p-2 text-xs sm:text-base md:text-lg lg:text-base font-thin">
                {fighter.name}
              </p>
            </div>
            <div className={`flex ${cornerColor === "red" && `flex-row-reverse`}`}>
              {/* 戦績 */}
              <div className="w-full">
                <div className="w-full">
                  <div className="flex">
                    <div className={`flex-1 text-xs text-center ${textColor}`}>WIN</div>
                    <div className={`flex-1 text-xs text-center ${textColor}`}>DRWA</div>
                    <div className={`flex-1 text-xs text-center ${textColor}`}>LOSE</div>
                  </div>
                  <div className="flex">
                    <div className="flex-1 py-1 text-white text-center bg-green-500 rounded-l-md">{`${fighter.win}`}</div>
                    <div className="flex-1 py-1 text-white text-center bg-stone-400">
                      {fighter.draw}
                    </div>
                    <div className="flex-1 py-1 text-white text-center bg-stone-700 rounded-r-md">
                      {fighter.lose}
                    </div>
                  </div>
                  <div
                    className={`w-1/3 text-center text-xs ${textColor}`}
                  >{`${fighter.ko} KO`}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);
