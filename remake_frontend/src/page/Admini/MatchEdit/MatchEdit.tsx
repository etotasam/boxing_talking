import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import clsx from "clsx";
//! data
import { GRADE } from "@/assets/boxerData";
//! layout
import AdminiLayout from "@/layout/AdminiLayout";
//! components
import { FightBox } from "@/components/module/FightBox";
import { FlagImage } from "@/components/atomc/FlagImage";
import { MatchSetter } from "@/components/module/MatchSetter/MatchSetter";
import { EngNameWithFlag } from "@/components/atomc/EngNameWithFlag";
// ! hooks
import { useFetchMatches } from "@/hooks/useMatch";
//! types
import {
  MatchesDataType,
  GRADE_Type,
  NationalityType,
  ORGANIZATIONS_Type,
  WEIGHT_CLASS_Type,
} from "@/assets/types";

// ! image
import crown from "@/assets/images/etc/champion.svg";

export const MatchEdit = () => {
  // ! use hook
  const { data: matchesData } = useFetchMatches();

  const [selectMatch, setSelectMatch] = useState<MatchesDataType>();
  return (
    <AdminiLayout>
      <div className="mt-[120px] flex w-full">
        <section className="w-[30%] flex justify-center">
          {selectMatch ? (
            <SelectoMatchComponent matchData={selectMatch} />
          ) : (
            <div className="w-[80%]">
              <div className="border-[1px] rounded-md border-stone-400 w-full min-h-[300px] flex justify-center items-center">
                <p className="text-[26px]">Select Match...</p>
              </div>
            </div>
          )}
        </section>

        <section className="w-[40%] flex justify-center">
          <MatchSetter selectMatch={selectMatch} />
        </section>

        <section className="w-[30%] flex justify-center">
          <MatchListComponent
            matchData={matchesData}
            selectMatch={selectMatch}
            setSelectMatch={setSelectMatch}
          />
        </section>
      </div>
    </AdminiLayout>
  );
};

type MatchComponentType = {
  matchData: MatchesDataType[] | undefined;
  selectMatch: MatchesDataType | undefined;
  setSelectMatch: React.Dispatch<
    React.SetStateAction<MatchesDataType | undefined>
  >;
};

export const MatchListComponent = ({
  matchData,
  selectMatch,
  setSelectMatch,
}: MatchComponentType) => {
  return (
    <>
      <ul className="w-[95%]">
        {matchData &&
          matchData.map((match) => (
            <li
              key={match.id}
              onClick={() => setSelectMatch(match)}
              className={clsx(
                "text-center border-[1px] border-stone-400 p-3 mb-5 w-full cursor-pointer",
                match.id === selectMatch?.id
                  ? `bg-yellow-100`
                  : `hover:bg-stone-200`
              )}
            >
              <h2 className="text-[18px]">
                {dayjs(match.match_date).format("YYYY年M月D日")}
              </h2>
              <div className="flex mt-3">
                <div className="flex-1">
                  {/* //? 国旗 */}
                  <div className="flex justify-center">
                    <EngNameWithFlag
                      boxerCountry={match.red_boxer.country}
                      boxerEngName={match.red_boxer.eng_name}
                    />
                  </div>
                  {/* //? 名前 */}
                  <p className="">{match.red_boxer.name}</p>
                </div>

                <div className="flex-1">
                  {/* //? 国旗 */}
                  <div className="flex justify-center">
                    <EngNameWithFlag
                      boxerCountry={match.blue_boxer.country}
                      boxerEngName={match.blue_boxer.eng_name}
                    />
                  </div>
                  {/* //? 名前 */}
                  <p className="">{match.blue_boxer.name}</p>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </>
  );
};

const SelectoMatchComponent = ({
  matchData,
}: {
  matchData: MatchesDataType | undefined;
}) => {
  if (!matchData) return <div>選択なし</div>;
  return (
    <div className="w-[80%]">
      {/* 日時 */}
      <div className="p-5 text-stone-600 border-[1px] rounded-md border-stone-400 w-full">
        <div className="text-center relative mt-5">
          <h2 className="text-2xl after:content-['(日本時間)'] after:absolute after:bottom-[-60%] after:left-[50%] after:translate-x-[-50%] after:text-sm">
            {dayjs(matchData.match_date).format("YYYY年M月D日")}
          </h2>
          {matchData.titles.length > 0 && (
            <span className="absolute top-[-32px] left-[50%] translate-x-[-50%] w-[32px] h-[32px] mr-2">
              <img src={crown} alt="" />
            </span>
          )}
        </div>

        {/* グレード */}
        <div className="text-center text-xl mt-5">
          {matchData.grade === "タイトルマッチ" ? (
            <ul className="flex flex-col">
              {matchData.titles.sort().map((title) => (
                <li key={title} className="mt-1">
                  <div className="relative inline-block text-[18px]">
                    <span className="absolute top-[4px] right-[-28px] w-[18px] h-[18px] mr-2">
                      <img src={crown} alt="" />
                    </span>
                    {title}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[30px] mt-10">{matchData.grade}</p>
          )}
        </div>

        {/* 会場 */}
        <div className="mt-[35px] text-center">
          <div className="relative inline-block text-lg before:content-['会場'] before:absolute before:top-[-25px] before:left-[50%] before:translate-x-[-50%] before:text-[14px] before:text-stone-500">
            {matchData.venue}
            <span className="w-[32px] h-[24px] border-[1px] overflow-hidden absolute top-[1px] left-[-40px]">
              <FlagImage nationaly={matchData.country} />
            </span>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="relative inline-block text-lg before:content-['階級'] before:absolute before:top-[-25px] before:min-w-[100px] before:left-[50%] before:translate-x-[-50%] before:text-[14px] before:text-stone-500">
            {`${matchData.weight.replace("S", "スーパー")}級`}
          </p>
        </div>
      </div>
    </div>
  );
};
