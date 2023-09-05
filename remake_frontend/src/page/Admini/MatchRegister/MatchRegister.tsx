import React, { useState } from "react";
//! layout
import AdminiLayout from "@/layout/AdminiLayout";
// ! hooks
import { useFetchBoxer, useUpdateBoxerData } from "@/hooks/useBoxer";
import { BoxerType } from "@/assets/types";
//! component
import { FlagImage } from "@/components/atomc/FlagImage";

export const MatchRegister = () => {
  const { boxersData } = useFetchBoxer();
  return (
    <AdminiLayout>
      <div>match register</div>
      <BoxersList boxersData={boxersData} />
    </AdminiLayout>
  );
};

type BoxerListType = {
  boxersData: BoxerType[] | undefined;
};
type MatchBoxersType = {
  red_boxer: BoxerType | undefined;
  blue_boxer: BoxerType | undefined;
};

const BoxersList = ({ boxersData }: BoxerListType) => {
  const [checked, setChecked] = useState<number>();
  const [matchBoxers, setMatchBoxers] = useState<MatchBoxersType>({
    red_boxer: undefined,
    blue_boxer: undefined,
  });

  console.log(matchBoxers);

  // console.log(matchBoxers);
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
    </>
  );
};
