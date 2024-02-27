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


export const apiFetchDataState = atomFamily<boolean, { dataName: DataNameType, state: DataFetchStateType }>({
  key: "apiFetchDataState",
  default: undefined
})