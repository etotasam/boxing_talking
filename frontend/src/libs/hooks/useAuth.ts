import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { AuthIs, fetchAuthUser, useUser, useHasAuth, useAuthUserLoading, useAuthUserError } from "@/store/slice/authUserSlice"

export const useAuth = () => {
  const dispatch = useDispatch()
  const hasAuth = useHasAuth()
  const pendingAuth = useAuthUserLoading()
  const hasAuthUserError = useAuthUserError()
  const authUser = useUser()
  useEffect(() => {
    if (hasAuth === AuthIs.UNDEFINED) {
      dispatch(fetchAuthUser())
    }
  }, [])

  return { authUser, hasAuth, pendingAuth, hasAuthUserError }
}