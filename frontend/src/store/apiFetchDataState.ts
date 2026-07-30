import { atomFamily } from "recoil";

//   "isLoading",
//   "isFetching",
//   "isSuccess",
//   "isError",

const state = [
  "loading",
  "fetching",
  "refetching",
  "success",
  "error",
  "idle"
] as const

const dataName = [
  "comments/fetch",
  "comments/post",
  "userPrediction/fetch",
  "userPrediction/post",
  "matchPrediction/fetch",
] as const

// type DataFetchStateType = (typeof dataFetchState)[number]
type DataNameType = (typeof dataName)[number]
export type ApiFetchStateType = (typeof state)[number]


//   key: "apiFetchDataState",
//   default: false

export const apiFetchState = atomFamily<ApiFetchStateType, DataNameType>(
  {
    key: "apiFetchState",
    default: "idle"
  }
)
