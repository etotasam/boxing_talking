import React, { useEffect, useState } from "react";
// ! data
import { Stance } from "@/assets/boxerData";
import { Nationality } from "@/assets/NationalFlagData";
//! type
import { BoxerType, StanceType } from "@/assets/types";
//! message contoller
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from "@/assets/statusesOnToastModal";
// ! hooks
import { useToastModal } from "@/hooks/useToastModal";

type PropsType = {
  onSubmit: (fighterData: BoxerType) => void;
  className?: string;
  isPending?: boolean;
  fighterData?: BoxerType;
  isSuccessRegisterFighter?: boolean;
};

const countryUndefined = "国籍の選択";

export const initialBoxerData: BoxerType = {
  name: "",
  engName: "",
  country: Nationality.Japan,
  birth: "1990-01-01",
  height: 165,
  reach: 165,
  haveTitle: [],
  style: Stance.Orthodox,
  win: 0,
  ko: 0,
  draw: 0,
  lose: 0,
};

const ORGANIZATIONS = {
  WBA: "WBA",
  WBC: "WBC",
  WBO: "WBO",
  IBF: "IBF",
} as const;

const WIGHT_CLASS = {
  Heavy: "ヘビー級",
  Curiser: "クルーザー",
  Light_Heavy: "ライトヘビー",
  Super_Middle: "Sミドル",
  Middle: "ミドル",
  Super_Welter: "Sウェルター",
  Welter: "ウェルター",
  Super_Light: "Sライト",
  Light: "ライト",
  Super_Feather: "Sフェザー",
  Feather: "フェザー",
  Super_Bantam: "Sバンタム",
  Bantam: "バンタム",
  Super_Fly: "Sフライ",
  Fly: "フライ",
  Light_Fly: "Lフライ",
  Minimum: "ミニマム",
} as const;

export const BoxerEditForm = (props: PropsType) => {
  const { setToastModal } = useToastModal();

  //? fighterデータ
  const [editBoxerData, setEditBoxerData] =
    useState<BoxerType>(initialBoxerData);

  // ? タイトル保持かどうか
  const [hasBelt, setHasBelt] = useState(false);

  const [organization, setOrganization] = useState<
    (typeof ORGANIZATIONS)[keyof typeof ORGANIZATIONS] | undefined
  >();

  //? props等、外部からFighterDataを受け取った時セットする
  useEffect(() => {
    if (!props.fighterData) return;
    setEditBoxerData(props.fighterData);
  }, [props.fighterData]);

  //? formデータのsubmit
  const sendData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editBoxerData.country === undefined) {
      setToastModal({
        message: MESSAGE.INVALID_COUNTRY,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      return;
    }
    props.onSubmit(editBoxerData);
  };

  //? formのデータを初期化
  useEffect(() => {
    if (!props.isSuccessRegisterFighter) return;
    setEditBoxerData(initialBoxerData);
  }, [props.isSuccessRegisterFighter]);

  return (
    <div className={props.className}>
      <div className="p-10 bg-stone-200">
        <h1 className="text-3xl text-center">選手情報</h1>
        <form className="flex flex-col" onSubmit={sendData}>
          <input
            className="mt-3 px-1 bourder rounded border-black"
            type="text"
            placeholder="名前(英字表示)"
            name="engName"
            value={editBoxerData?.engName}
            onChange={(e) =>
              setEditBoxerData((prev: any) => {
                return { ...prev, engName: e.target.value };
              })
            }
          />
          <input
            className="mt-3 px-1 bourder rounded border-black"
            type="text"
            placeholder="選手名"
            name="name"
            value={editBoxerData?.name}
            onChange={(e) =>
              setEditBoxerData((prev: any) => {
                return { ...prev, name: e.target.value };
              })
            }
          />
          <div className="flex mt-3">
            <label htmlFor="countrys">国籍:</label>
            <select
              name="country"
              value={editBoxerData?.country}
              onChange={(e) => {
                if (e.target.value === countryUndefined) {
                  setEditBoxerData((prev: any) => {
                    return { ...prev, country: undefined };
                  });
                } else {
                  setEditBoxerData((prev: any) => {
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
              value={editBoxerData?.birth}
              onChange={(e) =>
                setEditBoxerData((prev: BoxerType) => {
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
              value={editBoxerData?.height}
              onChange={(e) =>
                setEditBoxerData((prev: any) => {
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
              value={editBoxerData?.height}
              onChange={(e) =>
                setEditBoxerData((prev: any) => {
                  return { ...prev, reach: e.target.value };
                })
              }
            />
          </div>

          {/* stance */}
          <div className="mt-3 flex p-1">
            <label htmlFor="stance">スタイル:</label>
            <select
              value={editBoxerData?.style}
              onChange={(e) =>
                setEditBoxerData((prev: any) => {
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
                value={editBoxerData?.win}
                onChange={(e) =>
                  setEditBoxerData((prev: any) => {
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
                value={editBoxerData?.ko}
                onChange={(e) =>
                  setEditBoxerData((prev: any) => {
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
                value={editBoxerData?.draw}
                onChange={(e) =>
                  setEditBoxerData((prev: any) => {
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
                value={editBoxerData?.lose}
                onChange={(e) =>
                  setEditBoxerData((prev: any) => {
                    return { ...prev, lose: e.target.value };
                  })
                }
                type="number"
                min="0"
                id="lose"
              />
            </div>
          </div>

          {/* 保持タイトル */}
          <div className="mt-3">
            <label>
              <input
                className="mr-2"
                type="checkbox"
                checked={hasBelt}
                onChange={(e) => setHasBelt(e.target.checked)}
              />
              タイトル保持
            </label>
          </div>
          {hasBelt &&
            Object.keys(ORGANIZATIONS).map((key) => (
              <div key={key}>
                <div className="mt-3 flex p-1">
                  <label htmlFor="organzation">保持タイトル:</label>
                  <select
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value as any)}
                    name="boxing-style"
                    id="organzation"
                  >
                    <option value=""></option>
                    {(
                      Object.keys(WIGHT_CLASS) as Array<
                        keyof typeof WIGHT_CLASS
                      >
                    ).map((key) => (
                      <option key={key} value={`${key}${WIGHT_CLASS[key]}`}>
                        {WIGHT_CLASS[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
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
