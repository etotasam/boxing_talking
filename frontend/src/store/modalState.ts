import { atomFamily } from "recoil";

export type ModalNameType =
  | 'LOGIN'
  | 'BOXER_INFO'
  | 'PREDICTION_VOTE'
  | 'COMMENTS_MODAL';

export const modalState = atomFamily<boolean, ModalNameType>({
  key: "modalState",
  default: false
})
