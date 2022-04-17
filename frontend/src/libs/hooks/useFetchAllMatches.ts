import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { fetchMatches, useMatchesState, clearMatchesArray } from "@/store/slice/matchesSlice"

export const useFetchAllMatches = () => {
  const dispatch = useDispatch()
  const matchesState = useMatchesState()
  const clearMatches = () => dispatch(clearMatchesArray())

  const fetchAllMatches = async () => await dispatch(fetchMatches())

  // useEffect(() => {
  //   if (matchesState.matches !== undefined) return
  //   dispatch(fetchMatches())
  // }, [])

  return { matchesState, clearMatches, fetchAllMatches }
}