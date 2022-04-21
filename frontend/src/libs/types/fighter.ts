

export enum Stance {
  Southpaw = "southpaw",
  Orthodox = "orthodox",
}

export enum Nationality {
  Japan = "Japan",
  Mexico = "Mexico",
  USA = "USA",
  Kazakhstan = "Kazakhstan",
  UK = "UK",
  Rusia = "Rusia"
}

export type FighterType = {
  id: number,
  name: string,
  country: Nationality | undefined,
  birth: string;
  height: number | undefined,
  stance: Stance,
  ko: number,
  win: number,
  lose: number,
  draw: number
}

