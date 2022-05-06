import React, { useEffect, useState } from "react";
import { Button } from "@/components/atomic/Button";
import { Stance, Nationality, FighterType } from "@/libs/hooks/fetchers";
//! custom hook
import { useQueryState } from "@/libs/hooks/useQueryState";

//! component
import { SpinnerModal } from "@/components/modal/SpinnerModal";

type Props = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>, inputFighterInfo: FighterType) => void;
  className?: string;
  isUpdatingFighterData?: boolean;
  // fighterInfo?: FighterType;
};

type ToStringType<T> = T extends Record<"id", number> ? Record<string, string> : T;

export const initialFighterInfoState: any = {
  id: "",
  name: "",
  country: "",
  birth: "1990-01-01",
  height: "",
  stance: Stance.Orthodox,
  win: "",
  ko: "",
  draw: "",
  lose: "",
};

export const FighterEditForm = ({ onSubmit, className, isUpdatingFighterData }: Props) => {
  //? ReactQueryでFighterEditとデータを共有
  const [fighterData, setFighterData] = useQueryState<any>(
    "q/fighterData",
    initialFighterInfoState
  );

  return (
    <div className={className}>
      <div className="p-10 bg-stone-200">
        <h1 className="text-3xl text-center">選手情報</h1>
        <form className="flex flex-col" onSubmit={(e) => onSubmit(e, fighterData)}>
          <input
            className="mt-3 px-1 bourder rounded border-black"
            type="text"
            placeholder="選手名"
            name="name"
            value={fighterData?.name}
            onChange={(e) => setFighterData({ ...fighterData, name: e.target.value })}
          />
          <div className="flex mt-3">
            <label htmlFor="countrys">国籍:</label>
            <select
              name="country"
              value={fighterData?.country}
              onChange={(e) =>
                setFighterData({
                  ...fighterData,
                  country: e.target.value,
                })
              }
              id="countrys"
            >
              <option value={undefined}>選択してね</option>
              {Object.values(Nationality).map((nationalName) => (
                <option key={nationalName} value={nationalName}>
                  {nationalName}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3">
            <label htmlFor="birth">生年月日:</label>
            <input
              className="px-1"
              type="date"
              id="birth"
              min="1970-01-01"
              value={fighterData?.birth}
              onChange={(e) => setFighterData({ ...fighterData, birth: e.target.value })}
            />
          </div>

          <div className="mt-3 flex p-1">
            <label htmlFor="height">身長:</label>
            <input
              id="height"
              className="px-1"
              type="number"
              min="0"
              value={fighterData?.height}
              onChange={(e) =>
                setFighterData({
                  ...fighterData,
                  height: e.target.value,
                })
              }
            />
          </div>

          {/* stance */}
          <div className="mt-3 flex p-1">
            <label htmlFor="stance">スタイル:</label>
            <select
              value={fighterData?.stance}
              onChange={(e) =>
                setFighterData({
                  ...fighterData,
                  stance: e.target.value,
                })
              }
              name="boxing-style"
              id="stance"
            >
              <option value={Stance.Orthodox}>{Stance.Orthodox}</option>
              <option value={Stance.Southpaw}>{Stance.Southpaw}</option>
            </select>
          </div>

          {/* 戦績 */}
          <div className="flex w-full">
            <div className="mt-3 flex p-1">
              <label htmlFor="win">win</label>
              <input
                className="w-full"
                value={fighterData?.win}
                onChange={(e) => setFighterData({ ...fighterData, win: e.target.value })}
                type="number"
                min="0"
                id="win"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="ko">ko</label>
              <input
                className="w-full"
                value={fighterData?.ko}
                onChange={(e) => setFighterData({ ...fighterData, ko: e.target.value })}
                type="number"
                min="0"
                id="ko"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="draw">draw</label>
              <input
                className="w-full"
                value={fighterData?.draw}
                onChange={(e) =>
                  setFighterData({
                    ...fighterData,
                    draw: e.target.value,
                  })
                }
                type="number"
                min="0"
                id="draw"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="lose">lose</label>
              <input
                className="w-full"
                value={fighterData?.lose}
                onChange={(e) =>
                  setFighterData({
                    ...fighterData,
                    lose: e.target.value,
                  })
                }
                type="number"
                min="0"
                id="lose"
              />
            </div>
          </div>
          <div className="relative">
            <button
              className={`bg-green-600 hover:bg-green-500 w-full duration-300 py-1 px-2 rounded text-white`}
            >
              登録
            </button>
            {isUpdatingFighterData && <SpinnerModal className="bg-stone-700" />}
          </div>
        </form>
      </div>
    </div>
  );
};
