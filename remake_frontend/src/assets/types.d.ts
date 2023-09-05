// ! data
import { Stance, ORGANIZATIONS, WEIGHT_CLASS } from "@/assets/boxerData";
import { Nationality } from "@/assets/NationalFlagData"

export type UserType = {
  id: string | undefined,
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

// ? 試合情報
export type FightInfoType = {
  date: string,
  place: string,
  matchGrade: string[],
  class: string,
}

