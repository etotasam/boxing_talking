import React, { useEffect, useState } from "react";
// ! data
import { Stance, initialBoxerDataOnForm } from "@/assets/boxerData";
import { Nationality } from "@/assets/NationalFlagData";
import { ORGANIZATIONS, WEIGHT_CLASS } from "@/assets/boxerData";
//! type
import {
  BoxerType,
  StanceType,
  TitleType,
  BoxerDataOnFormType,
} from "@/assets/types";
// ! hooks
import { useBoxerDataOnForm } from "@/hooks/useBoxerDataOnForm";
// ! component
import { TitleSelector } from "./TitleSelector";

type PropsType = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  isPending?: boolean;
  editTargetBoxerData?: BoxerType | BoxerDataOnFormType;
  isSuccess?: boolean;
  isGuard?: boolean;
};

const countryUndefined = "国籍の選択";

export const BoxerEditForm = (props: PropsType) => {
  // ! use hook
  const { state: boxerDataOnForm, setter: setBoxerDataToForm } =
    useBoxerDataOnForm();

  // ? 入力させない様にするガードモーダル
  const { isGuard = false } = props;

  //? 登録が完了したらformのデータを初期化
  useEffect(() => {
    if (!props.isSuccess) return;
    setBoxerDataToForm(initialBoxerDataOnForm);
  }, [props.isSuccess]);

  return (
    <div className={`${props.className}`}>
      <div className="p-10 bg-stone-200 sticky top-[calc(100px+20px)]">
        <h1 className="text-3xl text-center">選手情報</h1>
        <form className="flex flex-col" onSubmit={props.onSubmit}>
          <input
            className="mt-3 px-1 bourder rounded border-black"
            type="text"
            placeholder="名前(英字表示)"
            name="eng_name"
            value={boxerDataOnForm?.eng_name}
            onChange={(e) =>
              setBoxerDataToForm((prev: any) => {
                return { ...prev, eng_name: e.target.value };
              })
            }
          />
          <input
            className="mt-3 px-1 bourder rounded border-black"
            type="text"
            placeholder="選手名"
            name="name"
            value={boxerDataOnForm?.name}
            onChange={(e) =>
              setBoxerDataToForm((prev: any) => {
                return { ...prev, name: e.target.value };
              })
            }
          />
          <div className="flex mt-3">
            <label htmlFor="countrys">国籍:</label>
            <select
              name="country"
              value={boxerDataOnForm?.country}
              onChange={(e) => {
                if (e.target.value === countryUndefined) {
                  setBoxerDataToForm((prev: any) => {
                    return { ...prev, country: undefined };
                  });
                } else {
                  setBoxerDataToForm((prev: any) => {
                    return { ...prev, country: e.target.value };
                  });
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
              value={boxerDataOnForm?.birth}
              onChange={(e) =>
                setBoxerDataToForm((prev: any) => {
                  return { ...prev, birth: e.target.value };
                })
              }
            />
          </div>

          <div className="mt-3 flex p-1">
            <label htmlFor="height">身長:</label>
            <input
              id="height"
              className="px-1"
              type="number"
              min="0"
              value={boxerDataOnForm?.height}
              onChange={(e) =>
                setBoxerDataToForm((prev: any) => {
                  return { ...prev, height: e.target.value };
                })
              }
            />
          </div>

          {/* リーチ */}
          <div className="mt-3 flex p-1">
            <label htmlFor="height">リーチ:</label>
            <input
              id="reach"
              className="px-1"
              type="number"
              min="0"
              value={boxerDataOnForm?.reach}
              onChange={(e) =>
                setBoxerDataToForm((prev: any) => {
                  return { ...prev, reach: e.target.value };
                })
              }
            />
          </div>

          {/* stance */}
          <div className="mt-3 flex p-1">
            <label htmlFor="stance">スタイル:</label>
            <select
              value={boxerDataOnForm?.style}
              onChange={(e) =>
                setBoxerDataToForm((prev: any) => {
                  return { ...prev, style: e.target.value };
                })
              }
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
                value={boxerDataOnForm?.win}
                onChange={(e) =>
                  setBoxerDataToForm((prev: any) => {
                    return { ...prev, win: e.target.value };
                  })
                }
                type="number"
                min="0"
                id="win"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="ko">ko</label>
              <input
                className="w-full"
                value={boxerDataOnForm?.ko}
                onChange={(e) =>
                  setBoxerDataToForm((prev: any) => {
                    return { ...prev, ko: e.target.value };
                  })
                }
                type="number"
                min="0"
                id="ko"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="draw">draw</label>
              <input
                className="w-full"
                value={boxerDataOnForm?.draw}
                onChange={(e) =>
                  setBoxerDataToForm((prev: any) => {
                    return { ...prev, draw: e.target.value };
                  })
                }
                type="number"
                min="0"
                id="draw"
              />
            </div>

            <div className="mt-3 flex p-1">
              <label htmlFor="lose">lose</label>
              <input
                className="w-full"
                value={boxerDataOnForm?.lose}
                onChange={(e) =>
                  setBoxerDataToForm((prev: any) => {
                    return { ...prev, lose: e.target.value };
                  })
                }
                type="number"
                min="0"
                id="lose"
              />
            </div>
          </div>

          {/* //! ベルト */}
          <div className="mt-3">
            <TitleSelector />
          </div>

          <div className="relative mt-10">
            <button
              className={`w-full duration-300 py-1 px-2 mt-3 rounded ${
                props.isPending
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
