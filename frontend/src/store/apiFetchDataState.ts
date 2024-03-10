import { atomFamily } from "recoil";

const dataFetchState = [
  "isLoading",
  "isFetching",
  "isSuccess",
  "isError",
] as const

const dataName = [
  "comments/fetch",
  "comments/post",
  "userPrediction/fetch",
  "userPrediction/post",
  "matchPrediction/fetch",
] as const

type DataFetchStateType = (typeof dataFetchState)[number]
type DataNameType = (typeof dataName)[number]


export const apiFetchDataState = atomFamily<boolean, { dataName: DataNameType, state: DataFetchStateType }>({
  key: "apiFetchDataState",
  default: undefined
})