import React from "react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { queryKeys } from "@/libs/queryKeys";
import { WINDOW_WIDTH } from "@/libs/utils";
//! type
import { FighterType } from "@/libs/hooks/useFighter";
//! layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";
//! hooks
import { useQueryState } from "@/libs/hooks/useQueryState";
import { useFetchFighters, limit } from "@/libs/hooks/useFighter";
import { useRegisterMatch } from "@/libs/hooks/useMatches";
import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";
//! component
import { Button } from "@/components/atomic/Button";
import { Fighter } from "@/components/module/Fighter";
import { TestFighter } from "@/components/module/TestFighter";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";
import { FighterSearchForm } from "@/components/module/FighterSearchForm";
import { PendingModal } from "@/components/modal/PendingModal";

type MatchFightersDataType = {
  red: FighterType | null;
  blue: FighterType | null;
};

type MatchDataType = {
  fighters: MatchFightersDataType;
  matchDate: string | null;
};

export const MatchRegister = () => {
  const { registerMatch, isLoading: isRegistringMatch } = useRegisterMatch();
  //? paramsの取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const paramPage = Number(query.get("page"));
  const paramName = query.get("name");
  const paramCountry = query.get("country");
  const navigate = useNavigate();

  const { width: windowWidth } = useGetWindowSize();

  useEffect(() => {
    if (!paramPage) return navigate("?page=1");
  }, [paramPage]);

  type SubjectType = {
    name: string;
    country: string;
  };
  const searchSub = { name: paramName, country: paramCountry };
  const params = (Object.keys(searchSub) as Array<keyof SubjectType>).reduce((acc, key) => {
    if (searchSub[key]) {
      return acc + `&${key}=${searchSub[key]}`;
    }
    return acc;
  }, "");

  const {
    data: fighterData,
    count: fightersCount,
    isPreviousData: isPreviousFightersData,
    isLoading: isFetchingFighters,
  } = useFetchFighters();

  const clearChecked = () => {
    setMatchData((oldData) => {
      return { ...oldData, fighters: { red: null, blue: null } };
    });
  };
  const isChecked = (id: number) => {
    return Object.values(matchData.fighters).some((fighter) => Number(fighter?.id) === Number(id));
  };

  const initialSetupData = {
    fighters: {
      red: null,
      blue: null,
    },
    matchDate: null,
  };
  //? setup data
  const { state: matchData, setter: setMatchData } = useQueryState<MatchDataType>(
    queryKeys.registerMatchData,
    initialSetupData
  );
  useEffect(() => {
    return () => {
      setMatchData(initialSetupData);
    };
  }, []);

  //? setup to the match data
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, fighter: FighterType) => {
    if (e.target.checked) {
      //? redが空いていれば入れる
      if (matchData.fighters.red === null) {
        setMatchData((oldData: MatchDataType) => {
          return {
            ...oldData,
            fighters: { red: fighter, blue: oldData.fighters.blue },
          };
        });
        return;
      }
      //? blueが空いていれば入れる
      if (matchData.fighters.blue === null) {
        setMatchData((oldData: MatchDataType) => {
          return {
            ...oldData,
            fighters: { red: oldData.fighters.red, blue: fighter },
          };
        });
        return;
      }
      return;
    }
    //? checked状態のobjectをクリックした時はチェックを外す
    const fightersState = (
      Object.keys(matchData.fighters) as Array<keyof MatchFightersDataType>
    ).reduce((acc, key) => {
      if (matchData.fighters[key]?.id === fighter.id) {
        return { ...acc, [key]: null };
      }
      return { ...acc };
    }, matchData.fighters);
    setMatchData((oldData) => {
      return { ...oldData, fighters: { ...fightersState } };
    });
  };

  const canCheck = (id: number) => {
    //? red,blueのどちらか一方でも選択されていなければチェックをつける事ができる
    if (Object.values(matchData.fighters).some((fighter) => fighter === null)) return false;
    //? 選択している選手はチェックをはずす事ができる
    if (Object.values(matchData.fighters).some((fighter) => Number(fighter?.id) === id)) {
      return false;
    }
    return true;
  };

  //? page数の計算
  const [pageCountArray, setPageCountArray] = useState<number[]>([]);
  useEffect(() => {
    if (fightersCount === undefined) return;
    const pagesCount = Math.ceil(fightersCount / limit);
    const pagesLength = [...Array(pagesCount + 1)].map((_, num) => num).filter((n) => n >= 1);
    setPageCountArray(pagesLength);
  }, [fightersCount]);

  //? 試合の登録
  const [postMatchPending] = useState(false);
  const matchRegister = async (): Promise<void> => {
    if (!matchData.fighters.red || !matchData.fighters.blue || !matchData.matchDate) return;

    registerMatch({
      red_fighter: matchData.fighters.red,
      blue_fighter: matchData.fighters.blue,
      match_date: matchData.matchDate,
    });
    //? matchesデータの再取得
    clearChecked();
    setMatchData({ matchDate: null, fighters: { red: null, blue: null } });
  };

  return (
    <LayoutForEditPage>
      <SelectFighters submit={matchRegister} />
      <div className="flex mt-[150px] w-full">
        <div className="w-full md:w-2/3">
          {/* //? ページネーション */}
          <div
            className={`z-50 flex justify-center items-center text-center sticky top-[200px] left-0 h-[35px] bg-black/50 w-full`}
          >
            {pageCountArray.length > 1 &&
              pageCountArray.map((page) => (
                <Link
                  key={page}
                  className={`ml-3 px-2 ${
                    page === paramPage ? `bg-green-500 text-white` : `bg-stone-200`
                  }`}
                  onClick={() => window.scrollTo(0, 0)}
                  to={`/match/register?page=${page}${params}`}
                >
                  <div className="text-center flex justify-center items-center">{page}</div>
                </Link>
              ))}
          </div>
          <div className="mt-3 mx-2">
            {fighterData && fighterData.length ? (
              fighterData.map((fighter) => (
                <div key={fighter.id} className="relative mt-3 first:mt-0">
                  <input
                    type="checkbox"
                    id={`fighter_${fighter.id}`}
                    value={fighter.id}
                    checked={isChecked(fighter.id)}
                    disabled={canCheck(fighter.id)}
                    onChange={(e) => handleCheckboxChange(e, fighter)}
                    className={`absolute top-[50%] left-3 translate-y-[-50%] cursor-pointer`}
                  />
                  <label className="cursor-pointer" htmlFor={`fighter_${fighter.id}`}>
                    <Fighter
                      fighter={fighter}
                      bgColorClassName={`bg-stone-200`}
                      windowWidth={windowWidth}
                    />
                  </label>
                </div>
              ))
            ) : (
              <div>該当の選手はいませんでした</div>
            )}
            {isPreviousFightersData && <PendingModal />}
          </div>
        </div>
        {windowWidth > WINDOW_WIDTH.md && (
          <div className="w-1/3 max-w-[500px]">
            <div className="flex flex-col sticky top-[200px]">
              <FighterSearchForm className="bg-stone-200" />
              <MatchDayEditForm onClick={clearChecked} />
            </div>
          </div>
        )}
      </div>
      {postMatchPending && <FullScreenSpinnerModal />}
      {isRegistringMatch && <PendingModal message="試合データ登録中..." />}
      {isFetchingFighters && <PendingModal message="選手データ取得中..." />}
    </LayoutForEditPage>
  );
};

type SelectFightersProps = {
  submit: () => void;
};

const SelectFighters = ({ submit }: SelectFightersProps) => {
  const { state: matchData } = useQueryState<MatchDataType>(queryKeys.registerMatchData);
  const [isSelectFighters, setIsSelectFighters] = useState(false);
  useEffect(() => {
    const result = !Object.values(matchData.fighters).some((faighter) => faighter === null);
    setIsSelectFighters(result);
  }, [matchData]);
  const { width: windowWidth } = useGetWindowSize();
  return (
    <div className="z-10 w-[100vw] fixed top-[50px] left-0 bg-stone-600">
      <div className="flex w-full h-[150px] p-3">
        {matchData.fighters.red ? (
          <TestFighter fighter={matchData.fighters.red} className={"w-1/2 bg-stone-100"} />
        ) : (
          // <Fighter
          //   bgColorClassName="w-1/2 bg-stone-100"
          //   fighter={matchData.fighters.red}
          //   windowWidth={windowWidth}
          // />
          <div className="w-1/2" />
        )}
        {matchData.fighters.blue && (
          <TestFighter fighter={matchData.fighters.blue} className={"w-1/2 bg-stone-100"} />
          // <Fighter
          //   isReverse={true}
          //   bgColorClassName="w-1/2 bg-stone-100"
          //   fighter={matchData.fighters.blue}
          //   windowWidth={windowWidth}
          // />
        )}
      </div>
      {isSelectFighters && matchData.matchDate && (
        <button
          onClick={submit}
          className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-green-500 text-white px-3 py-1"
        >
          登録
        </button>
      )}
      {isSelectFighters && (
        <div
          className={`absolute top-[20%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-white px-3 py-1 ${
            matchData.matchDate ? `bg-stone-600` : `bg-red-500`
          }`}
        >
          {matchData.matchDate
            ? dayjs(matchData.matchDate).format("YYYY/M/D")
            : "試合日が未設定です"}
        </div>
      )}
    </div>
  );
};

type MatchDayEditFormPropsType = {
  onClick: () => void;
};

const MatchDayEditForm = ({ onClick }: MatchDayEditFormPropsType) => {
  const { setter: setMatchData } = useQueryState<MatchDataType>(queryKeys.registerMatchData);
  return (
    <div className="bg-stone-200 flex justify-center items-center py-5 mt-5">
      <div className="w-[80%]">
        <div>
          <label htmlFor="match-date">試合日</label>
          <input
            className="p-1"
            id="match-date"
            type="date"
            min={dayjs().format("YYYY-MM-DD")}
            onChange={(e) =>
              setMatchData((prevData) => {
                return {
                  ...prevData,
                  matchDate: e.target.value,
                };
              })
            }
          />
        </div>
        <div className="mt-3">
          <Button className={`w-full`} onClick={onClick}>
            選手クリア
          </Button>
        </div>
      </div>
    </div>
  );
};
