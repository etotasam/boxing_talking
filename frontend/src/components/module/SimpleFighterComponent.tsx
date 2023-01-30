import React from "react";
import { FighterType } from "@/libs/types";
//! logic
import { getNationalFlagCssClass } from "@/libs/logic/getNationalFlagCssClass";

type FighterProps = {
  fighter: FighterType;
  className?: string;
  recordTextColor?: string;
  cornerColor?: "red" | "blue" | `undefined`;
};

export const SimpleFighterComponent = (props: FighterProps) => {
  const nationalFlag = getNationalFlagCssClass(props.fighter.country!);
  const textColor = props.recordTextColor ? props.recordTextColor : `text-stone-500`;
  return (
    <div className={`flex flex-col py-2 px-2 sm:px-10 ${props.className}`}>
      {props.fighter && (
        <>
          {/* name */}
          <div
            className={`flex justify-center items-center ${
              props.cornerColor === "red" ? `flex-row-reverse` : ``
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
              {props.fighter.name}
            </p>
          </div>
          <div className={`flex ${props.cornerColor === "red" && `flex-row-reverse`}`}>
            {/* 戦績 */}
            <div className="w-full">
              <div className="w-full">
                <div className="flex">
                  <div className={`flex-1 text-xs text-center ${textColor}`}>WIN</div>
                  <div className={`flex-1 text-xs text-center ${textColor}`}>DRWA</div>
                  <div className={`flex-1 text-xs text-center ${textColor}`}>LOSE</div>
                </div>
                <div className="flex">
                  <div className="flex-1 py-1 text-white text-center bg-green-500 rounded-l-md">{`${props.fighter.win}`}</div>
                  <div className="flex-1 py-1 text-white text-center bg-stone-400">
                    {props.fighter.draw}
                  </div>
                  <div className="flex-1 py-1 text-white text-center bg-stone-700 rounded-r-md">
                    {props.fighter.lose}
                  </div>
                </div>
                <div
                  className={`w-1/3 text-center text-xs ${textColor}`}
                >{`${props.fighter.ko} KO`}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
