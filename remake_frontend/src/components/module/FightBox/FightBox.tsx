import React from "react";

import japanFlag from "@/assets/images/flags/japan.svg";
import philpinFlag from "@/assets/images/flags/philpin.svg";
import crown from "@/assets/images/etc/champion.svg";
import { Nationality } from "@/assets/NationalFlagData";
// ! types
import { BoxerType, NationalityType, FightInfoType } from "@/assets/types";
// ! data
import { Stance } from "@/assets/boxerData";

const boxer_1: BoxerType = {
  id: 1,
  name: "井上 尚弥",
  eng_name: "Naoya Inoue",
  birth: "30",
  height: 165,
  reach: 171,
  style: Stance.Orthodox,
  country: Nationality.Japan,
  title_hold: ["WBO世界Sバンタム級王者", "WBC世界Sバンタム級王者"],
  win: 25,
  ko: 23,
  draw: 0,
  lose: 0,
};
const boxer_2: BoxerType = {
  id: 2,
  name: "タパレス",
  eng_name: "Marlon Tapales",
  birth: "31",
  height: 163,
  reach: 165,
  style: Stance.Southpaw,
  country: Nationality.Philpin,
  title_hold: [],
  win: 37,
  ko: 19,
  draw: 0,
  lose: 3,
};

const fightInfo = {
  date: "2023年10月28日",
  place: "日本・有明",
  matchGrade: ["WBA世界Sバンタム級", "IBF世界Sバンタム級"],
  class: "スーパーバンタム",
};

export const FightBox = () => {
  return (
    <>
      <section className="w-full h-full flex justify-center items-center">
        <div className="flex justify-between mt-8 w-[80%] max-w-[1024px] min-w-[900px] cursor-pointer border-[1px] border-stone-400 rounded-md md:hover:bg-neutral-100 md:hover:border-white md:duration-300">
          <div className="w-[300px]">
            <BoxerInfo boxer={boxer_1} />
          </div>

          <MatchInfo fightInfo={fightInfo} />

          <div className="w-[300px]">
            <BoxerInfo boxer={boxer_2} />
          </div>
        </div>
      </section>
    </>
  );
};

const BoxerInfo = ({ boxer }: { boxer: BoxerType }) => {
  // ? ボクサーの国旗取得
  const getNatinalFlag = (country: NationalityType) => {
    if (country == Nationality.Japan) return japanFlag;
    if (country == Nationality.Philpin) return philpinFlag;
  };

  return (
    <div className="w-[300px] h-full flex justify-center items-center">
      {/* <div className="h-[60%] border-b-[1px] border-stone-300">データ</div> */}
      <div className="text-center w-full px-5 py-10">
        <div>
          <div className="relative flex items-center justify-center">
            <span className="absolute top-[-25px] left-[50%] translate-x-[-50%] text-sm text-gray-600">
              {boxer.eng_name}
            </span>
            <h2 className="relative">
              {/* 国旗 */}
              <span className="w-[32px] h-[24px] border-[1px] overflow-hidden absolute top-0 left-[-40px]">
                <img src={getNatinalFlag(boxer.country)} alt="japan" />
              </span>
              {boxer.name}
            </h2>
          </div>
          {/* 戦績 */}
          <div>
            <ul className="flex justify-between w-full mt-10 text-white">
              <li className="relative flex-1 bg-red-500 before:content-['WIN'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm before:text-gray-600">
                {boxer.win}
                <span className="absolute text-sm bottom-[-20px] left-[50%] text-gray-600 translate-x-[-50%] after:content-['KO']">
                  {boxer.ko}
                </span>
              </li>
              <li className="relative flex-1 bg-gray-500 before:content-['DRAW'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm before:text-gray-600">
                {boxer.draw}
              </li>
              <li className="relative flex-1 bg-stone-800 before:content-['LOSE'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm before:text-gray-600">
                {boxer.lose}
              </li>
            </ul>
          </div>
          {/* ステータス */}
          <div className="mt-8">
            <ul>
              <li className="flex justify-between mt-2">
                <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                  年齢
                </p>
                <p className="flex-1">{boxer.birth}</p>
              </li>
              <li className="flex justify-between mt-2">
                <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                  身長
                </p>
                <p className="flex-1 after:content-['cm'] after:ml-1">
                  {boxer.height}
                </p>
              </li>
              <li className="flex justify-between mt-2">
                <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                  リーチ
                </p>
                <p className="flex-1 after:content-['cm'] after:ml-1">
                  {boxer.reach}
                </p>
              </li>
              <li className="flex justify-between mt-2">
                <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                  スタイル
                </p>
                <p className="flex-1">{boxer.style}</p>
              </li>
            </ul>
          </div>
          {/* タイトル */}
          <div className="mt-5">
            {boxer.title_hold && (
              <ul>
                {boxer.title_hold.map((belt: string) => (
                  <li key={belt} className="mt-2">
                    <p className="relative inline-block">
                      <span className="absolute top-[2px] left-[-23px] w-[18px] h-[18px] mr-2">
                        <img src={crown} alt="" />
                      </span>
                      {belt}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchInfo = ({ fightInfo }: { fightInfo: FightInfoType }) => {
  return (
    <>
      <div className="p-5 text-stone-600">
        <div className="text-center relative mt-5">
          <h2 className="text-2xl after:content-['(日本時間)'] after:absolute after:bottom-[-60%] after:left-[50%] after:translate-x-[-50%] after:text-sm">
            {fightInfo.date}
          </h2>
        </div>

        <div className="text-center text-xl mt-5">
          {fightInfo.matchGrade && (
            <ul className="flex flex-col">
              {fightInfo.matchGrade.map((grade) => (
                <li key={grade} className="mt-3">
                  <p className="relative inline-block">
                    <span className="absolute top-[4px] right-[-28px] w-[18px] h-[18px] mr-2">
                      <img src={crown} alt="" />
                    </span>
                    {grade}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-[50px] text-center">
          <p className="relative inline-block text-lg before:content-['会場'] before:absolute before:top-[-23px] before:left-[50%] before:translate-x-[-50%] before:text-[16px] before:text-stone-500">
            {fightInfo.place}
            <span className="w-[32px] h-[24px] border-[1px] overflow-hidden absolute top-[1px] left-[-40px]">
              <img src={japanFlag} alt="japan" />
            </span>
          </p>
        </div>

        <div className="mt-10 text-center">
          <p className="relative inline-block text-lg before:content-['階級'] before:absolute before:top-[-23px] before:left-[50%] before:translate-x-[-50%] before:text-[16px] before:text-stone-500">
            {fightInfo.class}
          </p>
        </div>
      </div>
    </>
  );
};
