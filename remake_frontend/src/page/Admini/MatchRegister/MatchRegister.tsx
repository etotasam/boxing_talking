import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
// ! types
import { NationalityType } from "@/assets/types";
// ! data
import { Nationality } from "@/assets/NationalFlagData";
import { WEIGHT_CLASS, ORGANIZATIONS } from "@/assets/boxerData";
//! layout
import AdminiLayout from "@/layout/AdminiLayout";
// ! hooks
import { useFetchBoxer } from "@/hooks/useBoxer";
import { BoxerType } from "@/assets/types";
//! component
import { FlagImage } from "@/components/atomc/FlagImage";

export const MatchRegister = () => {
  const { boxersData } = useFetchBoxer();
  const [matchBoxers, setMatchBoxers] = useState<MatchBoxersType>({
    red_boxer: undefined,
    blue_boxer: undefined,
  });
  return (
    <AdminiLayout>
      <div>match register</div>
      <div className="w-full flex">
        <section className="w-[70%] bg-cyan-100">
          <div>試合情報</div>
          <MatchSetter boxers={matchBoxers} />
          <MatchDataSetter onClick={() => {}} />
        </section>
        <section className="w-[30%] min-w-[300px] bg-red-100 flex justify-center">
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
const MatchSetter = ({ boxers }: { boxers: MatchBoxersType }) => {
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
                  // checked={boxer.id === checked}
                  // onChange={(e) => {
                  //   setChecked(boxer.id ? boxer.id : undefined);
                  //   setEditTargetBoxerData(boxer);
                  // }}
                  data-testid={`input-${boxer.id}`}
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
  onClick: () => void;
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

const MatchDataSetter = ({ onClick }: MatchDataSetterPropsType) => {
  // const [matchDate, setMatchDate] = useState<string>();
  const matchDate = useRef("");
  const [matchGrade, setMatchGrade] = useState<GRADE_Type>();
  // const matchGrade = useRef<GRADE_Type>();
  // const [matchPlaceCountry, setMatchPlaceCountry] = useState<NationalityType>();
  const matchPlaceCountry = useRef<NationalityType>();
  console.log(matchPlaceCountry);
  const matachCountry = useRef("");
  // const { setter: setMatchData } = useQueryState<MatchDataType>(queryKeys.registerMatchData);
  const matchWeight = useRef<WEIGHT_CLASS_Type>();
  const [belt, setBelt] = useState<ORGANIZATIONS_Type[]>([]);
  const [title, setTitle] = useState(false);
  const [counter, setCounter] = useState(1);
  useEffect(() => {
    if (matchGrade === GRADE.TITLE_MATCH) {
      setTitle(true);
    } else {
      setTitle(false);
    }
  }, [matchGrade]);

  const testclick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    console.log(matchDate.current);
    console.log(matchGrade);
    console.log(matchPlaceCountry.current);
    console.log(matachCountry.current);
  };
  return (
    <div className="bg-stone-200 flex justify-center items-center py-5 mt-5">
      <div className="w-[80%]">
        {/* //? Match Date */}
        <div>
          <label htmlFor="match-date">試合日</label>
          <input
            className="p-1"
            id="match-date"
            type="date"
            min={dayjs().format("YYYY-MM-DD")}
            onChange={(e) => {
              matchDate.current = e.target.value;
            }}
          />
        </div>
        {/* //? Match Grade */}
        <div>
          <label htmlFor="matchGrade">Match Grade:</label>
          <select
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
          <ul>
            {/* //? タイトル */}
            {Array.from({ length: counter }, (_, index) => index).map(
              (key, i) => (
                <li key={key}>
                  <select
                    name="matchBelt"
                    value={belt[i]}
                    onChange={(e) => {
                      setBelt((current) => {
                        return [
                          ...current,
                          e.target.value as ORGANIZATIONS_Type,
                        ];
                      });
                    }}
                    id="matchBelt"
                  >
                    <option value={undefined}></option>
                    {Object.values(ORGANIZATIONS).map((v) => (
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

        {/* //? Match Place */}
        <div>
          <label htmlFor="matchPlaceCountry">会場:</label>
          {/* //? 国旗用 国の選択 */}
          <select
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
        <input
          className="mt-3 px-1 bourder rounded border-black"
          type="text"
          placeholder="試合会場"
          name="matachCountry"
          // value={matachCountry.current}
          onChange={(e) => (matachCountry.current = e.target.value)}
        />

        {/* //? Weight */}
        <div>
          <label htmlFor="matchWeight">契約ウエイト:</label>
          <select
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

        <button onClick={testclick}>テスト</button>

        <div className="mt-3">
          <button className="bg-red-600 text-white" onClick={onClick}>
            選手クリア
          </button>
        </div>
      </div>
    </div>
  );
};
