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
  name: string;
  engName: string;
  age: number;
  height: number;
  reach: number;
  style: string;
  country: NationalityType;
  haveTitle: string[];
  win: number;
  ko: number;
  drwa: number;
  lose: number;
};

// ? 試合情報
export type FightInfoType = {
  date: string,
  place: string,
  matchGrade: string[],
  class: string,
}