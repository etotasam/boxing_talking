export type UserType = {
  id: string | undefined,
  name: string | undefined,
  // email: string | undefined,
}

export type MessageType = typeof MESSAGE[keyof typeof MESSAGE]
export type BgColorType = typeof BG_COLOR_ON_TOAST_MODAL[keyof typeof BG_COLOR_ON_TOAST_MODAL]

// ? 国旗など
export const Nationality = {
  Japan: "Japan",
  Mexico: "Mexico",
  USA: "USA",
  Kazakhstan: "Kazakhstan",
  UK: "UK",
  Rusia: "Rusia",
  Philpin: "Philpin",
  Ukrine: "Ukrine",
  Canada: "Canada",
  Venezuela: "Venezuela",
  Puerto_rico: "Puerto_rico"
} as const

type NationalityType = typeof Nationality[keyof typeof Nationality]