import { atomFamily } from "recoil";

const dataFetchState = [
  "isLoading",
  "isFetching",
] as const

const dataName = [
  "comments/fetch",
  "comments/post",
] as const

type DataFetchStateType = (typeof dataFetchState)[number]
type DataNameType = (typeof dataName)[number]
type ApiFetchDataStateType = { dataName: DataNameType, state: DataFetchStateType }

export const apiFetchDataState = atomFamily<boolean, ApiFetchDataStateType>({
  key: "apiFetchDataState",
  default: undefined
})