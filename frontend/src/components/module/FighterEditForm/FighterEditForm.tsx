import React, { useEffect, useState } from "react";
import { queryKeys } from "@/libs/queryKeys";
import { Nationality } from "@/libs/hooks/useFighter";
import { useQueryClient, useQuery } from "react-query";
//! custom hook
import { useQueryState } from "@/libs/hooks/useQueryState";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";

type Props = {
  onSubmit: () => void;
  className?: string;
  isUpdatingFighterData?: boolean;
};

export enum Stance {
  Southpaw = "southpaw",
  Orthodox = "orthodox",
}

const countryUndefined = "国籍の選択";

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
  const { setToastModalMessage } = useToastModal();
  const queryClient = useQueryClient();
  //? ReactQueryでFighterEditとデータを共有
  // const [fighterEditData, setFighterData] = useQueryState<any>(
  //   queryKeys.fighterEditData,
  //   initialFighterInfoState
  // );
  const fighterEditData = queryClient.getQueryData<any>(queryKeys.fighterEditData);

  const [name, setName] = useState<string>(initialFighterInfoState.name);
  const [country, setCountry] = useState<string | undefined>(initialFighterInfoState.country);
  const [birth, setBirth] = useState<string>(initialFighterInfoState.birth);
  const [height, setHeight] = useState<string>(initialFighterInfoState.height);
  const [stance, setStance] = useState<string>(initialFighterInfoState.stance);
  const [win, setWin] = useState<string>(initialFighterInfoState.win);
  const [ko, setKo] = useState<string>(initialFighterInfoState.ko);
  const [draw, setDraw] = useState<string>(initialFighterInfoState.draw);
  const [lose, setLose] = useState<string>(initialFighterInfoState.lose);

  useEffect(() => {
    setName(fighterEditData?.name);
    setCountry(fighterEditData?.country);
    setBirth(fighterEditData?.birth);
    setHeight(fighterEditData?.height);
    setStance(fighterEditData?.stance);
    setWin(fighterEditData?.win);
    setKo(fighterEditData?.ko);
    setDraw(fighterEditData?.draw);
    setLose(fighterEditData?.lose);
  }, [fighterEditData]);

  const sendData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (country === undefined) {
      setToastModalMessage({ message: MESSAGE.INVALID_COUNTRY, bgColor: ModalBgColorType.NOTICE });
      return;
    }
    queryClient.setQueryData(queryKeys.fighterEditData, {
      ...fighterEditData,
      name,
      stance,
      country,
      birth,
      height,
      win,
      ko,
      draw,
      lose,
    });
    onSubmit();
  };

  return (
    <div className={className}>
      <div className="p-10 bg-stone-200">
        <h1 className="text-3xl text-center">選手情報</h1>
        <form className="flex flex-col" onSubmit={sendData}>
          <input
            className="mt-3 px-1 bourder rounded border-black"
            type="text"
            placeholder="選手名"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex mt-3">
            <label htmlFor="countrys">国籍:</label>
            <select
              name="country"
              value={country}
              onChange={(e) => {
                if (e.target.value === countryUndefined) {
                  setCountry(undefined);
                } else {
                  setCountry(e.target.value);
                }
              }}
              id="countrys"
            >
              <option value={undefined}>{countryUndefined}</option>
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
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
            />
          </div>

          <div className="mt-3 flex p-1">
            <label htmlFor="height">身長:</label>
            <input
              id="height"
              className="px-1"
              type="number"
              min="0"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          {/* stance */}
          <div className="mt-3 flex p-1">
            <label htmlFor="stance">スタイル:</label>
            <select
              value={stance}
              onChange={(e) => setStance(e.target.value)}
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
                value={win}
                onChange={(e) => setWin(e.target.value)}
                type="number"
                min="0"
                id="win"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="ko">ko</label>
              <input
                className="w-full"
                value={ko}
                onChange={(e) => setKo(e.target.value)}
                type="number"
                min="0"
                id="ko"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="draw">draw</label>
              <input
                className="w-full"
                value={draw}
                onChange={(e) => setDraw(e.target.value)}
                type="number"
                min="0"
                id="draw"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="lose">lose</label>
              <input
                className="w-full"
                value={lose}
                onChange={(e) => setLose(e.target.value)}
                type="number"
                min="0"
                id="lose"
              />
            </div>
          </div>
          <div className="relative">
            <button
              className={`w-full duration-300 py-1 px-2 mt-3 rounded ${
                isUpdatingFighterData
                  ? `bg-stone-700 select-none pointer-events-none text-stone-600`
                  : `bg-green-600 hover:bg-green-500 text-white`
              }`}
            >
              登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
