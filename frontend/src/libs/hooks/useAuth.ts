import { useDispatch } from "react-redux"
import { AuthIs, fetchAuthUser, useAuthBySlice } from "@/store/slice/authUserSlice"
import { useEffect } from "react"

export const useAuth = () => {
  const dispatch = useDispatch()
  const authState = useAuthBySlice()

  const authCheckAPI = async () => await dispatch(fetchAuthUser())


  return { authState, authCheckAPI }
}