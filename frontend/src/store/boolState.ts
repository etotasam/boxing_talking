import { atomFamily } from "recoil";

export type AtomType = 'IS_SCROLL';

export const boolState = atomFamily<boolean, AtomType>({
  key: "boolState",
  default: false
})