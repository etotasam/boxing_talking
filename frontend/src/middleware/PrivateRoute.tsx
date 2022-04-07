import { useEffect } from "react";
import { AuthIs } from "@/store/slice/authUserSlice";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/libs/hooks/useAuth";
import { useMatchesByUserVoted } from "@/libs/hooks/useMatchesByUserVoted";
import { useGetAllMatches } from "@/libs/hooks/getAllMatches";

const PrivateRoute = () => {
  const { allMatches, pendingMatches } = useGetAllMatches();
  const { hasAuth, pendingAuth } = useAuth();
  const { pendingMatchesByUserVoted, matchesByUserVoted } =
    useMatchesByUserVoted();
  const navigate = useNavigate();

  // ログインしてない場合はhomeへ遷移
  useEffect(() => {
    if (hasAuth === AuthIs.FALSE) {
      navigate("/login");
    }
  }, [hasAuth]);

  return (pendingAuth && hasAuth === AuthIs.UNDEFINED) ||
    (pendingMatchesByUserVoted && matchesByUserVoted === undefined) ||
    (pendingMatches && allMatches === undefined) ? (
    <p>gating data...</p>
  ) : (
    <Outlet />
  );
};

export default PrivateRoute;
