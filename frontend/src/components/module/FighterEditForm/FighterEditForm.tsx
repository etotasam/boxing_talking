import React, { useEffect, useState } from "react";
import { Nationality } from "@/libs/hooks/useFighter";
//! type
import { FighterType } from "@/libs/types";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";

type PropsType = {
  onSubmit: (fighterData: FighterType) => void;
  className?: string;
  isPending?: boolean;
  fighterData?: FighterType;
  isSuccessRegisterFighter?: boolean;
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

export const FighterEditForm = (props: PropsType) => {
  const { setToastModalMessage } = useToastModal();

  //? fighterデータ
  const [editFighterData, setEditFighterData] = useState<FighterType>(initialFighterInfoState);

  //? props等、外部からFighterDataを受け取った時セットする
  useEffect(() => {
    if (!props.fighterData) return;
    setEditFighterData(props.fighterData);
  }, [props.fighterData]);

  //? formデータのsubmit
  const sendData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editFighterData.country === undefined) {
      setToastModalMessage({ message: MESSAGE.INVALID_COUNTRY, bgColor: ModalBgColorType.NOTICE });
      return;
    }
    props.onSubmit(editFighterData);
  };

  //? formのデータを初期化
  useEffect(() => {
    if (!props.isSuccessRegisterFighter) return;
    setEditFighterData(initialFighterInfoState);
  }, [props.isSuccessRegisterFighter]);

  return (
    <div className={props.className}>
      <div className="p-10 bg-stone-200">
        <h1 className="text-3xl text-center">選手情報</h1>
        <form className="flex flex-col" onSubmit={sendData}>
          <input
            className="mt-3 px-1 bourder rounded border-black"
            type="text"
            placeholder="選手名"
            name="name"
            value={editFighterData?.name}
            onChange={(e) =>
              setEditFighterData((prev: any) => {
                return { ...prev, name: e.target.value };
              })
            }
          />
          <div className="flex mt-3">
            <label htmlFor="countrys">国籍:</label>
            <select
              name="country"
              value={editFighterData?.country}
              onChange={(e) => {
                if (e.target.value === countryUndefined) {
                  setEditFighterData((prev: any) => {
                    return { ...prev, country: undefined };
                  });
                } else {
                  setEditFighterData((prev: any) => {
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
              value={editFighterData?.birth}
              onChange={(e) =>
                setEditFighterData((prev: any) => {
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
              value={editFighterData?.height}
              onChange={(e) =>
                setEditFighterData((prev: any) => {
                  return { ...prev, height: e.target.value };
                })
              }
            />
          </div>

          {/* stance */}
          <div className="mt-3 flex p-1">
            <label htmlFor="stance">スタイル:</label>
            <select
              value={editFighterData?.stance}
              onChange={(e) =>
                setEditFighterData((prev: any) => {
                  return { ...prev, stance: e.target.value };
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
                value={editFighterData?.win}
                onChange={(e) =>
                  setEditFighterData((prev: any) => {
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
                value={editFighterData?.ko}
                onChange={(e) =>
                  setEditFighterData((prev: any) => {
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
                value={editFighterData?.draw}
                onChange={(e) =>
                  setEditFighterData((prev: any) => {
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
                value={editFighterData?.lose}
                onChange={(e) =>
                  setEditFighterData((prev: any) => {
                    return { ...prev, lose: e.target.value };
                  })
                }
                type="number"
                min="0"
                id="lose"
              />
            </div>
          </div>
          <div className="relative">
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
