import { MESSAGE, BG_COLOR_ON_TOAST_MODAL } from "@/constants/statusesOnToastModal";

export type MessageType = typeof MESSAGE[keyof typeof MESSAGE];
export type BgColorType = typeof BG_COLOR_ON_TOAST_MODAL[keyof typeof BG_COLOR_ON_TOAST_MODAL];
