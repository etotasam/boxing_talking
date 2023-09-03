import { NationalityType } from "@/assets/types";
export const NationaFlag = {
  Japan: "t-flag-jp",
  Mexico: "t-flag-mx",
  USA: "t-flag-us",
  Kazakhstan: "t-flag-kz",
  UK: "t-flag-uk",
  Rusia: "t-flag-ru",
  Philpin: "t-flag-ph",
  Ukrine: "t-flag-ua",
  Canada: "t-flag-canada",
  Venezuela: "t-flag-venez",
  Puerto_rico: "t-flag-puerto_rico",
} as const;

export type NationalFlagCssClassType = typeof NationaFlag[keyof typeof NationaFlag]

export const getNationalFlagCssClass = (country: NationalityType): NationalFlagCssClassType => {
  return NationaFlag[country]
}