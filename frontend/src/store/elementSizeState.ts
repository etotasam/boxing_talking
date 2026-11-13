import { atomFamily } from "recoil";

type ElementNameAndPositionType =
  | 'HEADER_HEIGHT'
  | 'FOOTER_HEIGHT'
  | 'POST_COMMENT_HEIGHT'
  | 'MATCH_PAGE_BOXER_SECTION_HEIGHT'
  | 'COMMENTS_MODAL_HIDDEN_HEIGHT';

export const elementSizeState = atomFamily<number | undefined, ElementNameAndPositionType>({
  key: "elementSizeState",
  default: undefined
})
