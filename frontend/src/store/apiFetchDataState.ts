import { atomFamily } from "recoil";

//   "isLoading",
//   "isFetching",
//   "isSuccess",
//   "isError",

// type DataFetchStateType = (typeof dataFetchState)[number]
type DataNameType =
  | 'comments/fetch'
  | 'comments/post'
  | 'userPrediction/fetch'
  | 'userPrediction/post'
  | 'matchPrediction/fetch';
export type ApiFetchStateType =
  | 'loading'
  | 'fetching'
  | 'refetching'
  | 'success'
  | 'error'
  | 'idle';


//   key: "apiFetchDataState",
//   default: false

export const apiFetchState = atomFamily<ApiFetchStateType, DataNameType>(
  {
    key: "apiFetchState",
    default: "idle"
  }
)
