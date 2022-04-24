import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useVoteResultState, fetchUserVotes } from "@/store/slice/allVoteResultSlice"

export const useFetchUserVote = () => {
  const dispatch = useDispatch()
  const userVoteState = useVoteResultState()

  const fetchUserVoteWithUserId = async (userId: number) => await dispatch(fetchUserVotes(userId))

  return { userVoteState, fetchUserVoteWithUserId }
}