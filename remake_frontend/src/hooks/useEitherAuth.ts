import { QUERY_KEY } from "@/assets/queryKeys"
import { useQueryClient } from "react-query"

export const useEitherAuth = () => {
  const queryClient = useQueryClient()
  const isAuth = Boolean(queryClient.getQueryData(QUERY_KEY.auth))
  const isGuestAuth = Boolean(queryClient.getQueryData(QUERY_KEY.guest))

  const isEitherAuth = isAuth || isGuestAuth

  return { isEitherAuth }
}