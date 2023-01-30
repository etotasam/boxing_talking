import { Nationality, Stance } from "@/libs/hooks/useFighter"

export type UserType = {
  id: string,
  name: string,
  email: string,
  administrator?: boolean
}

export type MatchesType = {
  id: number;
  date: Date | string;
  red: FighterType;
  blue: FighterType;
  count_red: number;
  count_blue: number;
};

export type FighterType = {
  id: number,
  name: string,
  country: typeof Nationality[keyof typeof Nationality] | undefined,
  birth: string;
  height: number | undefined,
  stance: typeof Stance[keyof typeof Stance],
  ko: number,
  win: number,
  lose: number,
  draw: number
}

export type NationalityType = typeof Nationality[keyof typeof Nationality]
export type StanceType = typeof Stance[keyof typeof Stance]