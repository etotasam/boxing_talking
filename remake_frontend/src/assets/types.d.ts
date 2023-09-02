export type UserType = {
  id: string | undefined,
  name: string | undefined,
  email: string | undefined,
  administrator?: boolean | undefined
}

export type MessageType = typeof MESSAGE[keyof typeof MESSAGE]
export type BgColorType = typeof BG_COLOR_ON_TOAST_MODAL[keyof typeof BG_COLOR_ON_TOAST_MODAL]