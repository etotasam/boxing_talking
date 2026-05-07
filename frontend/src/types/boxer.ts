import { STANCE, ORGANIZATIONS, WEIGHT_CLASS } from "@/constants/boxerData";
import { CountryType } from "./common";

export type StanceType = typeof STANCE[keyof typeof STANCE];
export type OrganizationsType = typeof ORGANIZATIONS[keyof typeof ORGANIZATIONS];
export type WeightClassType = typeof WEIGHT_CLASS[keyof typeof WEIGHT_CLASS];

export type TitlesStateType = {
  organization: OrganizationsType;
  weight: WeightClassType;
  state?: "new" | "still" | "fall" | null;
};

export type BoxerType = {
  id: number;
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
  titles: TitlesStateType[] | [];
};

export type TitleType = {
  organization:
    | (typeof ORGANIZATIONS)[keyof typeof ORGANIZATIONS]
    | undefined;
  weightClass: (typeof WEIGHT_CLASS)[keyof typeof WEIGHT_CLASS] | undefined;
};
