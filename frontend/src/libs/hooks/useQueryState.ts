import React, { useRef } from "react"
import { useQuery, useQueryClient } from "react-query"
import type { QueryKey } from "react-query"

export const useQueryState = <T>(key: QueryKey, initialState?: T): { state: T, setter: React.Dispatch<React.SetStateAction<T>>, getLatestState: () => T | undefined } => {
  const state = useQuery(key, {
    enabled: false,
    ...((initialState !== undefined) ? { initialData: initialState } : {})
  }).data as T


  const queryClient = useQueryClient()

  const getLatestState = () => queryClient.getQueryData<T>(key)

  const setter = (arg: ((arg: T) => void) | T): void => {
    let newValue;
    if (typeof arg === "function") {
      const prevValue = queryClient.getQueryData<T>(key)
      newValue = (arg as any)(prevValue)
    } else {
      newValue = arg as any
    }
    queryClient.setQueryData<T>(key, newValue)
  }

  return { state, setter, getLatestState }
}