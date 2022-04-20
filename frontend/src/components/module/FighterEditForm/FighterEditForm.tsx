import React, { useState } from "react";
import { Button } from "@/components/atomic/Button";
import { Stance, Nationality } from "@/libs/types/fighter";

type Props = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>, inputFighterInfo: FighterProfile) => void;
  className?: string;
  fighterInfo?: FighterProfile;
};

export type FighterProfile = {
  name: string;
  country: Nationality | undefined;
  birth: string;
  height: string;
  stance: Stance;
  win: string;
  ko: string;
  draw: string;
  lose: string;
};

const initialFighterInfoState: FighterProfile = {
  name: "",
  country: undefined,
  birth: "1990-01-01",
  height: "",
  stance: Stance.Orthodox,
  win: "0",
  ko: "0",
  draw: "0",
  lose: "0",
};

export const FighterEditForm = ({ onSubmit, className, fighterInfo }: Props) => {
  const [fighterInfoState, setFighterInfoState] = useState<FighterProfile>(initialFighterInfoState);

  React.useEffect(() => {
    if (!fighterInfo) return;
    setFighterInfoState(fighterInfo);
  }, [fighterInfo]);

  return (
    <div className={className}>
      <div className="p-10 bg-stone-200">
        <h1 className="text-3xl text-center">選手情報</h1>
        <form className="flex flex-col" onSubmit={(e) => onSubmit(e, fighterInfoState)}>
          <input
            className="mt-3 px-1 bourder rounded border-black"
            type="text"
            placeholder="選手名"
            value={fighterInfoState?.name}
            onChange={(e) => setFighterInfoState({ ...fighterInfoState!, name: e.target.value })}
          />
          <div className="flex mt-3">
            <label htmlFor="countrys">国籍:</label>
            <select
              name="country"
              value={fighterInfoState.country}
              onChange={(e) => setFighterInfoState({ ...fighterInfoState!, country: e.target.value as Nationality })}
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
              value={fighterInfoState?.birth}
              onChange={(e) => setFighterInfoState({ ...fighterInfoState!, birth: e.target.value })}
            />
          </div>

          <div className="mt-3 flex p-1">
            <label htmlFor="height">身長:</label>
            <input
              className="px-1"
              type="number"
              min="0"
              value={fighterInfoState?.height}
              onChange={(e) => setFighterInfoState({ ...fighterInfoState!, height: e.target.value })}
            />
          </div>

          {/* stance */}
          <div className="mt-3 flex p-1">
            <label htmlFor="stance">スタイル:</label>
            <select
              value={fighterInfoState.stance}
              onChange={(e) => setFighterInfoState({ ...fighterInfoState!, stance: e.target.value as Stance })}
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
                value={fighterInfoState?.win}
                onChange={(e) => setFighterInfoState({ ...fighterInfoState!, win: e.target.value })}
                type="number"
                min="0"
                id="win"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="ko">ko</label>
              <input
                className="w-full"
                value={fighterInfoState?.ko}
                onChange={(e) => setFighterInfoState({ ...fighterInfoState!, ko: e.target.value })}
                type="number"
                min="0"
                id="ko"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="draw">draw</label>
              <input
                className="w-full"
                value={fighterInfoState?.draw}
                onChange={(e) => setFighterInfoState({ ...fighterInfoState!, draw: e.target.value })}
                type="number"
                min="0"
                id="draw"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="lose">lose</label>
              <input
                className="w-full"
                value={fighterInfoState?.lose}
                onChange={(e) => setFighterInfoState({ ...fighterInfoState!, lose: e.target.value })}
                type="number"
                min="0"
                id="lose"
              />
            </div>
          </div>
          <Button>登録</Button>
        </form>
      </div>
    </div>
  );
};
