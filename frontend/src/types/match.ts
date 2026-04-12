import { GRADE } from "@/assets/boxerData";
import { BoxerType, OrganizationsType, WeightClassType } from "./boxer";
import { CountryType } from "./common";

export type GradeType = typeof GRADE[keyof typeof GRADE];

export type FightInfoType = {
  date: string;
  place: string;
  matchGrade: string[];
  class: string;
};

export type MatchResultType = {
  isUpdateBoxerRecordChecked: boolean;
  matchId: number;
  result: "red" | "blue" | "draw" | "no-contest";
  detail?: "ko" | "tko" | "ud" | "md" | "sd";
  round?: string;
};

export type MatchTitlesType = {
  organization: OrganizationsType;
  weightDivision: WeightClassType;
}[];

export type MatchDataType = {
  id: number;
  redBoxer: BoxerType;
  blueBoxer: BoxerType;
  country: CountryType;
  venue: string;
  grade: GradeType;
  titles: MatchTitlesType | [];
  weight: WeightClassType;
  matchDate: string;
  result: MatchResultType | null;
};

export type MatchFormDataType = {
  matchDate: string;
  grade: GradeType | undefined;
  country: CountryType | undefined;
  venue: string | undefined;
  weight: WeightClassType | undefined;
  titles: OrganizationsType[] | [];
};

export type MatchUpdateFormType = {
  matchDate: string;
  grade: GradeType | undefined;
  country: CountryType | undefined;
  venue: string | undefined;
  weight: WeightClassType | undefined;
  titles: OrganizationsType[] | [];
};

export type RegisterMatchPropsType = Record<
  "redBoxerId" | "blueBoxerId",
  number | undefined
> &
  MatchFormDataType;
