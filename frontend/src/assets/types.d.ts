// ! data
import { STANCE, ORGANIZATIONS, WEIGHT_CLASS, GRADE } from "@/assets/boxerData";
import { COUNTRY } from "@/assets/nationalFlagData"
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
  engName: string;
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
export type RegisterMatchPropsType = Record<'redBoxerId' | 'blueBoxerId', number | undefined>
  & MatchFormDataType

export type MatchResultType = {
  matchId: number,
  result: "red" | "blue" | "draw" | "no-contest",
  detail?: "ko" | "tko" | "ud" | "md" | "sd",
  round?: string
}

export type MatchTitlesType = { organization: OrganizationsType, weightDivision: WeightClassType }[]

export type MatchDataType = {
  id: number,
  redBoxer: BoxerType,
  blueBoxer: BoxerType,
  country: CountryType,
  venue: string,
  grade: GradeType,
  titles: MatchTitlesType | [],
  weight: WeightClassType,
  matchDate: string,
  countRed: number,
  countBlue: number,
  result: MatchResultType | null,
}

export type MatchResultType = {
  matchId: number,
  matchResult: "red" | "blue" | "draw" | "no-contest",
  detail: "ko" | "tko" | "ud" | "md" | "sd",
  round: number
}

export type GradeType = typeof GRADE[keyof typeof GRADE];
export type WeightClassType = typeof WEIGHT_CLASS[keyof typeof WEIGHT_CLASS];
export type OrganizationsType = typeof ORGANIZATIONS[keyof typeof ORGANIZATIONS];


export type PredictionType = {
  id: number,
  matchId: number,
  prediction: "red" | "blue"
}


export type NeedMatchPropertyForUpdateType = {
  country: CountryType;
  grade: GradeType;
  venue: string;
  weight: number;
  titles: { organization: OrganizationsType, weightDivision: WeightClassType }[] | [];
  matchDate: string;
};


//? コメント

export type CommentType = {
  id: number;
  postUserName: string;
  comment: string;
  prediction: "red" | "blue" | undefined;
  createdAt: string;
}


export type MatchUpdateFormType = {
  matchDate: string;
  grade: GradeType | undefined;
  country: CountryType | undefined;
  venue: string | undefined;
  weight: WeightClassType | undefined;
  titles: OrganizationsType[] | [];
};

export type MatchFormDataType = {
  matchDate: string;
  grade: GradeType | undefined;
  country: CountryType | undefined;
  venue: string | undefined;
  weight: WeightClassType | undefined;
  titles: OrganizationsType[] | [];
}


//? 試合予想投票数

export type MatchPredictionsType = {
  totalVotes: number,
  red: number,
  blue: number
}