import { useDispatch } from "react-redux"
import { fetchFighters, axiosCancel, useFightersState } from "@/store/slice/fightersSlice"

export const useFetchFighters = () => {
  const dispatch = useDispatch()

  const fetchAllFighters = async () => await dispatch(fetchFighters())
  const cancel = () => dispatch(axiosCancel())
  const fightersState = useFightersState()

  return { fetchAllFighters, fightersState, cancel }
}