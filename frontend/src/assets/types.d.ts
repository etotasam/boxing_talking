// ! data
import { STANCE, ORGANIZATIONS, WEIGHT_CLASS, GRADE } from "@/assets/boxerData";
import { COUNTRY } from "@/assets/NationalFlagData"
import { MESSAGE, BG_COLOR_ON_TOAST_MODAL } from "./statusesOnToastModal";

export type UserType = {
  name: string | undefined,
}

export type MessageType = typeof MESSAGE[keyof typeof MESSAGE]
export type BgColorType = typeof BG_COLOR_ON_TOAST_MODAL[keyof typeof BG_COLOR_ON_TOAST_MODAL]

// ? 国旗
export type CountryType = typeof COUNTRY[keyof typeof COUNTRY]


// ? ボクサー情報
export type BoxerType = {
  id: number,
  name: string;
  eng_name: string;
  birth: string;
  height: number;
  reach: number;
  style: StanceType;
  country: CountryType;
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
  country: CountryType,
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

export type MatchTitlesType = { organization: OrganizationsType, weightDivision: WeightClassType }[]

export type MatchDataType = {
  id: number,
  red_boxer: BoxerType,
  blue_boxer: BoxerType,
  country: CountryType,
  venue: string,
  grade: GradeType,
  titles: MatchTitlesType | [],
  weight: WeightClassType,
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

export type GradeType = typeof GRADE[keyof typeof GRADE];
export type WeightClassType = typeof WEIGHT_CLASS[keyof typeof WEIGHT_CLASS];
export type OrganizationsType = typeof ORGANIZATIONS[keyof typeof ORGANIZATIONS];


export type PredictionType = {
  id: number,
  match_id: number,
  prediction: "red" | "blue"
}


export type NeedMatchPropertyForUpdateType = {
  country: CountryType;
  grade: GradeType;
  venue: string;
  weight: number;
  titles: { organization: OrganizationsType, weightDivision: WeightClassType }[] | [];
  match_date: string;
};


//? コメント

export type CommentType = {
  id: number;
  post_user_name: string;
  comment: string;
  prediction: "red" | "blue" | undefined;
  created_at: string;
}


export type MatchUpdateFormType = {
  match_date: string;
  grade: GradeType | undefined;
  country: CountryType | undefined;
  venue: string;
  weight: WeightClassType | undefined;
  titles: OrganizationsType[] | [];
};