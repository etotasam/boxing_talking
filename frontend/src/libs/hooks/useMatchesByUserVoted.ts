import { useCallback, useEffect, DependencyList } from "react"
import { useDispatch } from "react-redux"
import { fetchUserVotes, setVotes, useVotes, useUserVotesLoading, useUserVotesError } from "@/store/slice/userVoteSlice"
import { useHasAuth, AuthIs, useUser } from "@/store/slice/authUserSlice"

export const useMatchesByUserVoted = () => {
  const dispatch = useDispatch()
  const pendingMatchesByUserVoted = useUserVotesLoading()
  const matchesByUserVoted = useVotes()
  const hasErrorMatchesByUserVoted = useUserVotesError()
  const hasAuth = useHasAuth()
  const { id: userId } = useUser()

  useEffect(() => {
    if (hasAuth !== AuthIs.TRUE || isNaN(userId)) return
    dispatch(fetchUserVotes(userId))
  }, [hasAuth])

  return { pendingMatchesByUserVoted, matchesByUserVoted, hasErrorMatchesByUserVoted }
}