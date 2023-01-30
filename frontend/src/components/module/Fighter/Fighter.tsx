import React from "react";
import dayjs from "dayjs";
import { FighterType } from "@/libs/types";
import { WINDOW_WIDTH } from "@/libs/utils";
//! logic
import { getNationalFlagCssClass } from "@/libs/logic/getNationalFlagCssClass";

type FighterProps = {
  fighter: FighterType;
  bgColorClassName?: string;
  windowWidth: number | undefined;
  recordTextColor?: string;
  isReverse?: boolean;
};

export const Fighter = React.memo(
  ({
    fighter,
    bgColorClassName,
    isReverse = false,
    recordTextColor,
    windowWidth,
  }: FighterProps) => {
    const bgColor = bgColorClassName ? bgColorClassName : `bg-stone-200`;
    const today = dayjs();
    const birthday = fighter.birth;
    const age = today.diff(birthday, "year");

    const nationalFlag = getNationalFlagCssClass(fighter.country!);
    const textColor = recordTextColor ? recordTextColor : `text-stone-500`;
    return (
      <div className={`flex flex-col p-3 ${bgColor}`}>
        {fighter && windowWidth && (
          <>
            {/* //? name */}
            <div
              className={`flex justify-center items-center md:px-10 ${
                isReverse && `flex-row-reverse`
              }`}
            >
              <p className="p-2 text-base sm:text-lg font-thin text-center">{fighter.name}</p>
              <span className={`${nationalFlag} block t-flag w-[25px] h-[25px]`} />
            </div>

            <div className={`flex sm:justify-between ${isReverse && `flex-row-reverse`}`}>
              {windowWidth > WINDOW_WIDTH.sm && (
                <div className="sm:w-2/5 md:w-1/2 text-stone-700 flex justify-center">
                  <table className="w-[70%] ">
                    <tbody>
                      <tr>
                        <td>年齢</td>
                        <td>{age}</td>
                      </tr>
                      <tr>
                        <td>身長</td>
                        <td>{fighter.height} cm</td>
                      </tr>
                      <tr>
                        <td>スタイル</td>
                        <td>{fighter.stance}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* //? 戦績 */}
              <div className="w-full sm:w-3/5 md:w-1/2">
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
                <div className={`w-1/3 text-center text-xs ${textColor}`}>{`${fighter.ko} KO`}</div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);
