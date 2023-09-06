import React from "react";
// ! data
import { Nationality } from "@/assets/NationalFlagData";
// ! components
import { FightBox } from "@/components/module/FightBox";
// ! hooks
import { useFetchBoxer } from "@/hooks/useBoxer";

const fightInfo = {
  date: "2023年10月28日",
  place: "日本・有明",
  country: Nationality.Japan,
  matchGrade: "タイトルマッチ",
  titleMatch: ["WBA世界Sバンタム級", "IBF世界Sバンタム級"],
  weight: "スーパーバンタム",
};

export const Home = () => {
  // ! use hook
  const { boxersData } = useFetchBoxer();
  return (
    <>
      <div>Home</div>
      {boxersData && (
        <FightBox
          boxer_1={boxersData[0]}
          boxer_2={boxersData[8]}
          matchInfo={fightInfo}
          className="border-[1px] border-stone-300 rounded-md"
        />
      )}
    </>
  );
};
