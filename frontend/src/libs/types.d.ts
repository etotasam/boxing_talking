export type FighterType = {
  id: number,
  name: string,
  country: string,
  ko: number,
  win: number,
  lose: number,
  draw: number
}

export type UserType = {
  id: number,
  name: string,
  email: string
}

export type MatchesType = {
  id: number;
  date: string;
  red: Fighter;
  blue: Fighter;
};