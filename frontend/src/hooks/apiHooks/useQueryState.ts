import React from "react"
import { useQuery, QueryKey, useQueryClient } from "react-query"

export const useQueryState = <T>(key: QueryKey, initialState?: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const state = useQuery(key, {
    enabled: false,
    staleTime: Infinity,
    keepPreviousData: true,
    ...((initialState !== undefined) ? { initialData: initialState } : {})
  }).data as T

  const queryClient = useQueryClient()

  const setter = (arg: ((arg: T) => void) | T): void => {
    let newValue;
    if (typeof arg === "function") {
      const nowValue = queryClient.getQueryData<T>(key)
      newValue = (arg as any)(nowValue) // arg(nowValue)だよ。関数
    } else {
      newValue = arg as any
    }
    queryClient.setQueryData<T>(key, newValue)
  }

  return [state, setter]
}