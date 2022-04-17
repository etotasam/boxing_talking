import { useEffect } from "react";
import { AuthIs } from "@/store/slice/authUserSlice";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/libs/hooks/useAuth";
import { useFetchVoteResult } from "@/libs/hooks/useFetchVoteResult";
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";

const PrivateRoute = () => {
  const { matchesState, fetchAllMatches } = useFetchAllMatches();
  const { authState, authCheckAPI } = useAuth();
  const { voteResultState, fetchVoteResult } = useFetchVoteResult();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // if (matchesState.matches === undefined) {
      //   fetchAllMatches();
      // }
      if (authState.hasAuth === AuthIs.TRUE) {
        fetchVoteResult(authState.user.id);
      }
      if (authState.hasAuth === AuthIs.UNDEFINED) {
        authCheckAPI();
      }
      if (authState.hasAuth === AuthIs.FALSE) {
        navigate("/login");
      }
    })();
  }, [authState.hasAuth]);

  const gettingData =
    (authState.pending && authState.hasAuth === AuthIs.UNDEFINED) ||
    (voteResultState.pending && voteResultState.votes === undefined) ||
    (matchesState.pending && matchesState.matches === undefined);

  return gettingData ? <p>gating data...</p> : <Outlet />;
  // return authState.pending ||
  //   voteResultState.pending ||
  //   matchesState.pending ? (
  //   <p>gating data...</p>
  // ) : (
  //   <Outlet />
  // );
};

export default PrivateRoute;
