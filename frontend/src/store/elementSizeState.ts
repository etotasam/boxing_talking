import { atomFamily } from "recoil";

const elementNameAndPosition = [
  "HEADER_HEIGHT",
  "FOOTER_HEIGHT",
  "POST_COMMENT_HEIGHT",
  "MATCH_PAGE_BOXER_SECTION_HEIGHT",
  "WINDOW_WIDTH"
] as const

type ElementNameAndPositionType = (typeof elementNameAndPosition)[number]

export const elementSizeState = atomFamily<number | undefined, ElementNameAndPositionType>({
  key: "elementSizeState",
  default: undefined
})