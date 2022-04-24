import { useEffect } from "react";
import { AuthIs } from "@/store/slice/authUserSlice";
import { useNavigate, Outlet } from "react-router-dom";

//! hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useFetchUserVote } from "@/libs/hooks/useFetchUserVote";
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";

//! component
import { LoadingModal } from "@/components/modal/LoadingModal";

const PrivateRoute = () => {
  // const { matchesState, fetchAllMatches } = useFetchAllMatches();
  const { authState, authCheckAPI } = useAuth();
  // const { userVoteState, fetchUserVoteWithUserId } = useFetchUserVote();
  const navigate = useNavigate();

  useEffect(() => {
    // (async () => {
    // if (matchesState.matches === undefined) {
    //   fetchAllMatches();
    // }
    // if (authState.hasAuth === AuthIs.TRUE) {
    //   fetchUserVoteWithUserId(authState.user.id);
    // }
    // if (authState.hasAuth === AuthIs.UNDEFINED) {
    //   authCheckAPI();
    // }
    if (authState.hasAuth === AuthIs.FALSE) {
      navigate("/");
    }
    // })();
  }, [authState.hasAuth]);

  // const gettingData =
  //   (authState.pending && authState.hasAuth === AuthIs.UNDEFINED) ||
  //   (userVoteState.pending && userVoteState.votes === undefined) ||
  //   (matchesState.pending && matchesState.matches === undefined);

  return <Outlet />;
};

export default PrivateRoute;
