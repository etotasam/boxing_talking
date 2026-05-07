import { atomFamily } from "recoil";

// const dataFetchState = [
//   "isLoading",
//   "isFetching",
//   "isSuccess",
//   "isError",
// ] as const

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


// export const apiFetchDataState = atomFamily<boolean, { dataName: DataNameType, state: DataFetchStateType }>({
//   key: "apiFetchDataState",
//   default: false
// })

export const apiFetchState = atomFamily<ApiFetchStateType, DataNameType>(
  {
    key: "apiFetchState",
    default: "idle"
  }
)
