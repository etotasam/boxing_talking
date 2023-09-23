// ! data
import { Stance, ORGANIZATIONS, WEIGHT_CLASS } from "@/assets/boxerData";
import { Nationality } from "@/assets/NationalFlagData"
import { MESSAGE, BG_COLOR_ON_TOAST_MODAL } from "./statusesOnToastModal";
import { linksArray } from "@/assets/pathLinks";

export type UserType = {
  // id: string | undefined,
  name: string | undefined,
  // email: string | undefined,
}

export type MessageType = typeof MESSAGE[keyof typeof MESSAGE]
export type BgColorType = typeof BG_COLOR_ON_TOAST_MODAL[keyof typeof BG_COLOR_ON_TOAST_MODAL]

// ? 国旗
export type NationalityType = typeof Nationality[keyof typeof Nationality]

// ? ボクサー情報
export type BoxerType = {
  id: number,
  name: string;
  eng_name: string;
  birth: string;
  height: number;
  reach: number;
  style: StanceType;
  country: NationalityType;
  title_hold: string[];
  win: number;
  ko: number;
  draw: number;
  lose: number;
};

export type BoxerDataOnFormType = {
  id: number,
  name: string;
  eng_name: string;
  birth: string;
  height: number;
  reach: number;
  style: StanceType;
  country: NationalityType;
  title_hold: TitleType[];
  win: number;
  ko: number;
  draw: number;
  lose: number;
};

export type TitleType = {
  organization:
  | (typeof ORGANIZATIONS)[keyof typeof ORGANIZATIONS]
  | undefined;
  weightClass: (typeof WEIGHT_CLASS)[keyof typeof WEIGHT_CLASS] | undefined;
};


export type StanceType = typeof Stance[keyof typeof Stance]

////////// ? 試合情報

export type FightInfoType = {
  date: string,
  place: string,
  matchGrade: string[],
  class: string,
}
//? 登録用 matchデータ
export type RegisterMatchPropsType = {
  red_boxer_id: number,
  blue_boxer_id: number,
  match_date: string,
  grade: string,
  country: NationalityType,
  venue: string,
  weight: string,
  titles: string[],
}

export type MatchDataType = {
  id: number,
  red_boxer: BoxerType,
  blue_boxer: BoxerType,
  country: NationalityType,
  venue: string,
  grade: string,
  titles: string[],
  weight: WEIGHT_CLASS_Type,
  match_date: string,
  count_red: number,
  count_blue: number,
}

export type GRADE_Type = (typeof GRADE)[keyof typeof GRADE];
export type WEIGHT_CLASS_Type = (typeof WEIGHT_CLASS)[keyof typeof WEIGHT_CLASS];
export type ORGANIZATIONS_Type = (typeof ORGANIZATIONS)[keyof typeof ORGANIZATIONS];


export type PredictionType = {
  id: number,
  match_id: number,
  prediction: "red" | "blue"
}