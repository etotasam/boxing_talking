import React, { useEffect, useState } from "react";
import _ from "lodash";
// ! data
import { ORGANIZATIONS, WEIGHT_CLASS } from "@/assets/boxerData";
// ! types
import { TitleType } from "@/assets/types";
// ! hooks
import { useBoxerDataOnForm } from "@/hooks/useBoxerDataOnForm";

type PropsType = {
  setTitles: React.Dispatch<React.SetStateAction<TitleType[]>>;
  titles: TitleType[];
};

export const TitleSelector = () => {
  // ! use hook
  const { state: boxerDataOnForm, setter: setBoxerDataToForm } =
    useBoxerDataOnForm();
  // ? タイトル保持かどうかチェックボックスの値 useState
  const [hasBelt, setHasBelt] = useState(true);
  // ? タイトル入力欄(<input> <select>)の数を決める useState
  const [countHasBelt, setCountHasBelt] = useState(1);

  // ? 団体と階級を選択した場合入力欄を追加
  useEffect(() => {
    if (!boxerDataOnForm.title_hold.length) {
      setCountHasBelt(1);
      return;
    }
    const lastIndex = boxerDataOnForm.title_hold.length - 1;
    if (!boxerDataOnForm.title_hold[lastIndex]?.weightClass) return;
    setCountHasBelt(boxerDataOnForm.title_hold.length + 1);
  }, [boxerDataOnForm.title_hold]);

  return (
    <>
      <section className="">
        <p>保有タイトル</p>
        {Array.from({ length: countHasBelt }, (_, index) => index).map(
          (key, i) => (
            <div key={key} className="flex">
              {/* //? 団体選択 */}
              <div className="mt-3 flex p-1">
                <select
                  value={
                    boxerDataOnForm.title_hold[i]
                      ? boxerDataOnForm.title_hold[i].organization
                      : ""
                  }
                  onChange={(e) =>
                    setBoxerDataToForm((boxerDataOnForm) => {
                      const copyTitles = _.cloneDeep(boxerDataOnForm);
                      if (!e.target.value) {
                        // delete copyTitles.title_hold[i];
                        copyTitles.title_hold[i] = {
                          ...copyTitles.title_hold[i],
                          organization: undefined,
                        };
                        return copyTitles;
                        // return copyTitles.title_hold.filter(
                        //   (obj) => obj !== undefined
                        // );
                      } else {
                        copyTitles.title_hold[i] = {
                          ...copyTitles.title_hold[i],
                          organization: e.target
                            .value as (typeof ORGANIZATIONS)[keyof typeof ORGANIZATIONS],
                        };
                        return copyTitles;
                      }
                    })
                  }
                  // name="boxing-style"
                  // id="organzation"
                >
                  <option value=""></option>
                  {(
                    Object.keys(ORGANIZATIONS) as Array<
                      keyof typeof ORGANIZATIONS
                    >
                  ).map((key) => (
                    <option key={key} value={ORGANIZATIONS[key]}>
                      {ORGANIZATIONS[key]}
                    </option>
                  ))}
                </select>
              </div>
              {/* //? 階級選択 */}
              <div className="mt-3 flex p-1">
                <select
                  value={
                    boxerDataOnForm.title_hold[i]
                      ? boxerDataOnForm.title_hold[i].weightClass
                      : ""
                  }
                  onChange={(e) =>
                    setBoxerDataToForm((boxerDataOnForm) => {
                      const copyTitles = _.cloneDeep(boxerDataOnForm);
                      if (!e.target.value) {
                        copyTitles.title_hold[i] = {
                          ...copyTitles.title_hold[i],
                          weightClass: undefined,
                        };
                        return copyTitles;
                      } else {
                        copyTitles.title_hold[i] = {
                          ...copyTitles.title_hold[i],
                          weightClass: e.target
                            .value as (typeof WEIGHT_CLASS)[keyof typeof WEIGHT_CLASS],
                        };
                        return copyTitles;
                      }
                    })
                  }
                  // name="aaaaaaaa"
                  // id="class"
                >
                  <option value=""></option>
                  {(
                    Object.keys(WEIGHT_CLASS) as Array<
                      keyof typeof WEIGHT_CLASS
                    >
                  ).map((key) => (
                    <option key={key} value={WEIGHT_CLASS[key]}>
                      {WEIGHT_CLASS[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        )}
      </section>
    </>
  );
};
