import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { cloneDeep } from "lodash";
// ! types
import { NationalityType, RegstarMatchPropsType } from "@/assets/types";
// ! data
import { Nationality } from "@/assets/NationalFlagData";
import { WEIGHT_CLASS, ORGANIZATIONS } from "@/assets/boxerData";
import {
  MESSAGE,
  BG_COLOR_ON_TOAST_MODAL,
} from "@/assets/statusesOnToastModal";
//! layout
import AdminiLayout from "@/layout/AdminiLayout";
// ! hooks
import { useFetchBoxer } from "@/hooks/useBoxer";
import { BoxerType } from "@/assets/types";
import { useRegisterMatch } from "@/hooks/useMatch";
import { useToastModal } from "@/hooks/useToastModal";
//! component
import { FlagImage } from "@/components/atomc/FlagImage";
import { SearchBoxer } from "@/components/module/SearchBoxer";

export const MatchRegister = () => {
  const { boxersData } = useFetchBoxer();
  const [matchBoxers, setMatchBoxers] = useState<MatchBoxersType>({
    red_boxer: undefined,
    blue_boxer: undefined,
  });
  return (
    <AdminiLayout>
      <div className="w-full flex">
        <section className="w-[70%]">
          <div className="sticky top-[calc(100px+20px)] mt-[20px]">
            <MatchSetUpBox boxers={matchBoxers} />
            <div className="flex mt-5">
              <div className="w-[50%] flex justify-center">
                <MatchDataSetter matchBoxers={matchBoxers} />
              </div>
              <div className="w-[50%] flex justify-center">
                <div className="w-[90%]">
                  <SearchBoxer />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-[30%] min-w-[300px] border-l-[1px] border-stone-200 flex justify-center">
          <BoxersList
            boxersData={boxersData}
            matchBoxers={matchBoxers}
            setMatchBoxers={setMatchBoxers}
          />
        </section>
      </div>
    </AdminiLayout>
  );
};

// ! 対戦相手
const MatchSetUpBox = ({ boxers }: { boxers: MatchBoxersType }) => {
  return (
    <div className="flex items-center h-[150px] bg-gray-50">
      <div className="flex justify-between w-full">
        <div className="flex-1 flex justify-center">
          {boxers.red_boxer && <BoxerBox boxerData={boxers.red_boxer} />}
        </div>

        <div className="flex-1 flex justify-center">
          {boxers.blue_boxer && <BoxerBox boxerData={boxers.blue_boxer} />}
        </div>
      </div>
    </div>
  );
};
// ! 選手
const BoxerBox = ({ boxerData }: { boxerData: BoxerType }) => {
  return (
    <>
      <div className="w-[300px] mt-3 border-[1px] border-stone-300 rounded-md p-3">
        <div className="text-center">
          <p className="">{boxerData.eng_name}</p>
          <h2 className="relative inline-block">
            {boxerData.name}
            <FlagImage
              nationaly={boxerData.country}
              className="absolute top-0 right-[-45px]"
            />
          </h2>
        </div>
      </div>
    </>
  );
};

// ! 選手リスト
type BoxerListType = {
  boxersData: BoxerType[] | undefined;
  matchBoxers: MatchBoxersType;
  setMatchBoxers: React.Dispatch<React.SetStateAction<MatchBoxersType>>;
};
type MatchBoxersType = {
  red_boxer: BoxerType | undefined;
  blue_boxer: BoxerType | undefined;
};

const BoxersList = ({
  boxersData,
  matchBoxers,
  setMatchBoxers,
}: BoxerListType) => {
  const isChecked = (id: number) => {
    return Object.values(matchBoxers).some((boxer) => boxer && boxer.id === id);
  };

  // ? ボクサーを選択出来るかどうかの判断（チェックボックスの状態を確認）
  const canCheck = (id: number) => {
    //? red,blueのどちらか一方でも選択されていなければチェックをつける事ができる
    if (Object.values(matchBoxers).some((boxer) => boxer === undefined))
      return false;
    //? 選択している選手はチェックをはずす事ができる
    if (Object.values(matchBoxers).some((boxer) => boxer && boxer.id === id)) {
      return false;
    }
    return true;
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    boxer: BoxerType
  ) => {
    if (e.target.checked) {
      //? redが空いていれば入れる
      if (matchBoxers.red_boxer === undefined) {
        setMatchBoxers((current: MatchBoxersType) => {
          return { ...current, red_boxer: boxer };
        });
        return;
      }
      //? blueが空いていれば入れる
      if (matchBoxers.blue_boxer === undefined) {
        setMatchBoxers((current: MatchBoxersType) => {
          return { ...current, blue_boxer: boxer };
        });
        return;
      }
      return;
    }

    //? checked状態のobjectをクリックした時はチェックを外す
    const selectedBoxerState = (
      Object.keys(matchBoxers) as Array<keyof MatchBoxersType>
    ).reduce((acc, key) => {
      if (matchBoxers[key]?.id === boxer.id) {
        return { ...acc, [key]: undefined };
      }
      return { ...acc };
    }, matchBoxers);
    setMatchBoxers(selectedBoxerState);
  };

  return (
    <>
      <div className="my-5">
        {boxersData && (
          <ul className="flex justify-center flex-col">
            {boxersData.map((boxer) => (
              <div className="relative" key={boxer.eng_name}>
                <input
                  className="absolute top-[50%] left-5 translate-y-[-50%] cursor-pointer"
                  id={`${boxer.id}_${boxer.name}`}
                  type="checkbox"
                  name="boxer"
                  value={boxer.id}
                  checked={isChecked(boxer.id)}
                  disabled={canCheck(boxer.id)}
                  onChange={(e) => handleCheckboxChange(e, boxer)}
                />
                <label
                  className={"w-[90%] cursor-pointer"}
                  htmlFor={`${boxer.id}_${boxer.name}`}
                >
                  <li className="w-[300px] mt-3 border-[1px] border-stone-300 rounded-md p-3">
                    <div className="text-center">
                      <p className="">{boxer.eng_name}</p>
                      <h2 className="relative inline-block">
                        {boxer.name}
                        <FlagImage
                          nationaly={boxer.country}
                          className="absolute top-0 right-[-45px]"
                        />
                      </h2>
                    </div>
                  </li>
                </label>
              </div>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

// ! 試合情報セッター
type MatchDataSetterPropsType = {
  matchBoxers: MatchBoxersType;
};

const GRADE = {
  TITLE_MATCH: "タイトルマッチ",
  R10: "10R",
  R8: "8R",
  R6: "6R",
  R4: "4R",
} as const;

type GRADE_Type = (typeof GRADE)[keyof typeof GRADE];
type WEIGHT_CLASS_Type = (typeof WEIGHT_CLASS)[keyof typeof WEIGHT_CLASS];
type ORGANIZATIONS_Type = (typeof ORGANIZATIONS)[keyof typeof ORGANIZATIONS];

// ! 試合データ入力
const MatchDataSetter = ({ matchBoxers }: MatchDataSetterPropsType) => {
  //? use hook
  const { showToastModal, setToastModal, hideToastModal } = useToastModal();
  const { registerMatch } = useRegisterMatch();
  const matchDate = useRef("");
  const [matchGrade, setMatchGrade] = useState<GRADE_Type>();
  const matchPlaceCountry = useRef<NationalityType>();
  const matchVenue = useRef("");
  const matchWeight = useRef<WEIGHT_CLASS_Type>();
  const [belt, setBelt] = useState<ORGANIZATIONS_Type[]>([]);
  const [title, setTitle] = useState(false);
  const [counter, setCounter] = useState(1);

  // ? アンマウント時にはトーストモーダルを隠す
  useEffect(() => {
    return () => {
      hideToastModal();
    };
  }, []);
  // ? gradeがタイトルマッチ以外の時は belt (WBA WBCとか...)を空にする
  useEffect(() => {
    if (!title) return setBelt([]);
  }, [title]);

  // ? WBA WBC WBO IBFを選ぶ<select>の数を管理
  useEffect(() => {
    if (belt.length > 3) return;
    if (!belt.length) {
      setCounter(1);
    } else {
      setCounter(belt.length + 1);
    }
  }, [belt]);

  useEffect(() => {
    if (matchGrade === GRADE.TITLE_MATCH) {
      setTitle(true);
    } else {
      setTitle(false);
    }
  }, [matchGrade]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ? 選手を選択していない場合モーダルでNOTICE
    if (Object.values(matchBoxers).includes(undefined)) {
      setToastModal({
        message: MESSAGE.MATCH_BOXER_NOT_SELECTED,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }

    // ? 他、未入力がある場合はモーダルでNOTICE
    if (
      !matchDate.current ||
      !matchGrade ||
      !matchPlaceCountry.current ||
      !matchVenue.current ||
      !matchWeight.current
    ) {
      setToastModal({
        message: MESSAGE.MATCH_HAS_NOT_ENTRIES,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    } else if (matchGrade === GRADE.TITLE_MATCH && !belt.length) {
      setToastModal({
        message: MESSAGE.MATCH_HAS_NOT_ENTRIES,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
    }

    let formattedBelt;
    if (belt.length) {
      formattedBelt = belt.map((title) => {
        return `${title}世界${matchWeight.current!}級`;
      });
    } else {
      formattedBelt = cloneDeep(belt);
    }

    const matchData: RegstarMatchPropsType = {
      red_boxer_id: matchBoxers.red_boxer!.id!,
      blue_boxer_id: matchBoxers.blue_boxer!.id!,
      match_date: matchDate.current,
      grade: matchGrade!,
      country: matchPlaceCountry.current!,
      venue: matchVenue.current,
      weight: matchWeight.current!,
      titles: formattedBelt,
    };
    registerMatch(matchData);
  };
  return (
    // <div className="bg-stone-200 flex justify-center items-center py-5 mt-5">
    <form
      className="w-[400px] bg-stone-200 border-[1px] border-stone-400 p-5"
      onSubmit={onSubmit}
    >
      <h2 className="text-center my-5 text-[26px] tracking-[0.1em]">
        試合情報
      </h2>
      {/* //? Match Date */}
      <div className="flex">
        {/* <div className="w-[100px] text-right"> */}
        <label className="w-[130px] text-right mr-3" htmlFor="match-date">
          試合日
        </label>
        {/* </div> */}
        <input
          className="w-[150px] p-1"
          id="match-date"
          type="date"
          min={dayjs().format("YYYY-MM-DD")}
          onChange={(e) => {
            matchDate.current = e.target.value;
          }}
        />
      </div>

      {/* //? Match Grade */}
      <div className="flex mt-5">
        <label className="w-[130px] text-right mr-3" htmlFor="matchGrade">
          Match Grade:
        </label>
        <select
          className="w-[150px]"
          name="matchGrade"
          // value={matchGrade}
          onChange={(e) => {
            setMatchGrade(e.target.value as GRADE_Type);
          }}
          id="matchGrade"
        >
          <option value={undefined}></option>
          {Object.values(GRADE).map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </div>

      {title && (
        <ul className="ml-[140px]">
          {/* //? タイトル */}
          {Array.from({ length: counter }, (_, index) => index).map(
            (key, i) => (
              <li className="mt-1" key={i}>
                <select
                  className="w-[150px]"
                  name="matchBelt"
                  value={belt[i]}
                  onChange={(e) => {
                    setBelt((current) => {
                      const clone = cloneDeep(current);
                      clone[i] = e.target.value as ORGANIZATIONS_Type;
                      return clone;
                    });
                  }}
                  id="matchBelt"
                >
                  <option value={undefined}></option>
                  {Object.values(ORGANIZATIONS).map((v, index) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </li>
            )
          )}
        </ul>
      )}

      {/* //? Weight */}
      <div className="flex mt-5">
        <label className="w-[130px] text-right mr-3" htmlFor="matchWeight">
          契約ウエイト:
        </label>
        <select
          className="w-[150px]"
          name="matchWeight"
          // value={matachCountry.current}
          onChange={(e) => {
            matchWeight.current = e.target.value as WEIGHT_CLASS_Type;
          }}
          id="matchWeight"
        >
          <option value={undefined}></option>
          {Object.values(WEIGHT_CLASS).map((weight) => (
            <option key={weight} value={weight}>
              {weight}
            </option>
          ))}
        </select>
      </div>

      {/* //? Match Place */}
      <div className="flex mt-5">
        <label
          className="w-[130px] text-right mr-3"
          htmlFor="matchPlaceCountry"
        >
          会場:
        </label>
        {/* //? 国旗用 国の選択 */}
        <select
          className="w-[150px]"
          name="matchPlaceCountry"
          // value={matachCountry.current}
          onChange={(e) => {
            matchPlaceCountry.current = e.target.value as NationalityType;
          }}
          id="matchPlaceCountry"
        >
          <option value={undefined}></option>
          {Object.values(Nationality).map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      {/* //? 会場 */}
      <div className="flex mt-2 ml-[140px]">
        <input
          className="w-full px-1 bourder border-black"
          type="text"
          placeholder="試合会場入力"
          name="matachCountry"
          // value={matachCountry.current}
          onChange={(e) => (matchVenue.current = e.target.value)}
        />
      </div>

      <div className="w-full flex justify-center">
        <button className="bg-stone-600 tracking-[0.5em] text-white py-2 px-5 rounded mt-10 w-full">
          登録
        </button>
      </div>
    </form>
    // </div>
  );
};
