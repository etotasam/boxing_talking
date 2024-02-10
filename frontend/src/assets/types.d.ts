// ! data
import { STANCE, ORGANIZATIONS, WEIGHT_CLASS } from "@/assets/boxerData";
import { NATIONALITY } from "@/assets/NationalFlagData"
import { MESSAGE, BG_COLOR_ON_TOAST_MODAL } from "./statusesOnToastModal";
import { needMatchPropertyForUpdate } from "@/assets/needMatchPropertyForUpdate"

export type UserType = {
  name: string | undefined,
}

export type MessageType = typeof MESSAGE[keyof typeof MESSAGE]
export type BgColorType = typeof BG_COLOR_ON_TOAST_MODAL[keyof typeof BG_COLOR_ON_TOAST_MODAL]

// ? 国旗
export type NationalityType = typeof NATIONALITY[keyof typeof NATIONALITY]

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
  win: number;
  ko: number;
  draw: number;
  lose: number;
  titles: { organization: string | undefined, weight: string | undefined }[] | []
};

export type TitleType = {
  organization:
  | (typeof ORGANIZATIONS)[keyof typeof ORGANIZATIONS]
  | undefined;
  weightClass: (typeof WEIGHT_CLASS)[keyof typeof WEIGHT_CLASS] | undefined;
};


export type StanceType = typeof STANCE[keyof typeof STANCE]

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

export type MatchResultType = {
  match_id: number,
  result: "red" | "blue" | "draw" | "no-contest",
  detail?: "ko" | "tko" | "ud" | "md" | "sd",
  round?: string
}

export type MatchDataType = {
  id: number,
  red_boxer: BoxerType,
  blue_boxer: BoxerType,
  country: NationalityType,
  venue: string,
  grade: string,
  titles: { organization: ORGANIZATIONS_Type, weightDivision: WEIGHT_CLASS_Type }[] | [],
  weight: WEIGHT_CLASS_Type,
  match_date: string,
  count_red: number,
  count_blue: number,
  result: MatchResultType | null,
}

export type MatchResultType = {
  match_id: number,
  match_result: "red" | "blue" | "draw" | "no-contest",
  detail: "ko" | "tko" | "ud" | "md" | "sd",
  round: number
}

export type GRADE_Type = (typeof GRADE)[keyof typeof GRADE];
export type WEIGHT_CLASS_Type = (typeof WEIGHT_CLASS)[keyof typeof WEIGHT_CLASS];
export type ORGANIZATIONS_Type = (typeof ORGANIZATIONS)[keyof typeof ORGANIZATIONS];


export type PredictionType = {
  id: number,
  match_id: number,
  prediction: "red" | "blue"
}


export type NeedMatchPropertyForUpdateType = {
  country: NationalityType;
  grade: GRADE_Type;
  venue: string;
  weight: number;
  titles: { organization: ORGANIZATIONS_Type, weightDivision: WEIGHT_CLASS_Type }[] | [];
  match_date: string;
};
