import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { fetchMatches, useMatches, useMatchesLoading, useMatchesError } from "@/store/slice/matchesSlice"

export const useGetAllMatches = () => {
  const dispatch = useDispatch()
  const allMatches = useMatches()
  const pendingMatches = useMatchesLoading()
  const hasErrorGetMatches = useMatchesError()

  useEffect(() => {
    if (allMatches !== undefined) return
    dispatch(fetchMatches())
  }, [])

  return { allMatches, pendingMatches, hasErrorGetMatches }
}