import { useQueryClient } from "react-query"


export const useReactQuery = () => {
  const queryClient = useQueryClient()

  const getReactQueryData = <T>(queryKey: string): T => {
    const res = queryClient.getQueryData(queryKey) as T
    return res
  }

  const setReactQueryData = <T>(queryKey: string, newData: T): void => {
    queryClient.setQueriesData(queryKey, newData) as T
  }

  const refetchReactQueryData = (queryKey: string): void => {
    queryClient.refetchQueries(queryKey)
  }

  const refetchReactQueryArrayKeys = (queryKeys: string[]) => {
    queryKeys.forEach(key => {
      queryClient.refetchQueries(key)
    });
  }


  return { getReactQueryData, setReactQueryData, refetchReactQueryData, refetchReactQueryArrayKeys }

}