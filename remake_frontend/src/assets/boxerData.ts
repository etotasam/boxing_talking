import { BoxerType, BoxerDataOnFormType } from "./types";
import { Nationality } from "./NationalFlagData";

export const Stance = {
  Southpaw: "southpaw",
  Orthodox: "orthodox",
  Unknown: "unknown"
} as const


export const ORGANIZATIONS = {
  WBC_INTERIM: "WBC暫定",
  WBO_INTERIM: "WBO暫定",
  WBA: "WBA",
  WBC: "WBC",
  WBO: "WBO",
  IBF: "IBF",
} as const;

export const WEIGHT_CLASS = {
  Heavy: "ヘビー",
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

export const initialBoxerData: BoxerType = {
  id: NaN,
  name: "",
  eng_name: "",
  country: Nationality.Japan,
  birth: "1990-01-01",
  height: 165,
  reach: 165,
  title_hold: [],
  style: Stance.Orthodox,
  win: 0,
  ko: 0,
  draw: 0,
  lose: 0,
};

export const initialBoxerDataOnForm: BoxerDataOnFormType = {
  id: NaN,
  name: "",
  eng_name: "",
  country: Nationality.Japan,
  birth: "1990-01-01",
  height: 165,
  reach: 165,
  title_hold: [],
  style: Stance.Unknown,
  win: 0,
  ko: 0,
  draw: 0,
  lose: 0,
};

export const GRADE = {
  TITLE_MATCH: "タイトルマッチ",
  R10: "10R",
  R8: "8R",
  R6: "6R",
  R4: "4R",
} as const;