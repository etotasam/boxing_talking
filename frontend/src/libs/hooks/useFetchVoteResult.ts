import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useVoteResultState, fetchUserVotes } from "@/store/slice/allVoteResultSlice"

export const useFetchVoteResult = () => {
  const dispatch = useDispatch()
  const voteResultState = useVoteResultState()

  const fetchVoteResult = async (userId: number) => await dispatch(fetchUserVotes(userId))

  return { voteResultState, fetchVoteResult }
}