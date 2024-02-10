import { BoxerType } from "./types";
import { NATIONALITY } from "./NationalFlagData";

export const STANCE = {
  SOUTHPAW: "southpaw",
  ORTHODOX: "orthodox",
  UNKNOWN: "unknown"
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
  HEAVY: "ヘビー",
  CRUISER: "クルーザー",
  LIGHT_HEAVY: "ライトヘビー",
  S_MIDDLE: "Sミドル",
  MIDDLE: "ミドル",
  S_WELTER: "Sウェルター",
  WELTER: "ウェルター",
  S_LIGHT: "Sライト",
  LIGHT: "ライト",
  S_FEATHER: "Sフェザー",
  FEATHER: "フェザー",
  S_BANTAM: "Sバンタム",
  BANTAM: "バンタム",
  S_FLY: "Sフライ",
  FLY: "フライ",
  L_FLY: "Lフライ",
  MINIMUM: "ミニマム",
} as const;

export const initialBoxerData: BoxerType = {
  id: NaN,
  name: "",
  eng_name: "",
  country: NATIONALITY.JAPAN,
  birth: "1990-01-01",
  height: 165,
  reach: 165,
  style: STANCE.ORTHODOX,
  win: 0,
  ko: 0,
  draw: 0,
  lose: 0,
  titles: []
};

export const initialBoxerDataOnForm: BoxerType = {
  id: NaN,
  name: "",
  eng_name: "",
  country: NATIONALITY.JAPAN,
  birth: "1990-01-01",
  height: 165,
  reach: 165,
  style: STANCE.UNKNOWN,
  win: 0,
  ko: 0,
  draw: 0,
  lose: 0,
  titles: []
};

export const GRADE = {
  // UNDEFINED: undefined,
  TITLE_MATCH: "タイトルマッチ",
  R12: "12R",
  R10: "10R",
  R8: "8R",
  R6: "6R",
  R4: "4R",
} as const;