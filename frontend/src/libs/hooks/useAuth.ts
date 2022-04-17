import { useDispatch } from "react-redux"
import { AuthIs, fetchAuthUser, useAuthBySlice } from "@/store/slice/authUserSlice"

export const useAuth = () => {
  const dispatch = useDispatch()
  const authState = useAuthBySlice()

  const authCheckAPI = async () => await dispatch(fetchAuthUser())

  return { authState, authCheckAPI }
}