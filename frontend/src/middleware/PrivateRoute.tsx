import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

//! hooks
import { useAuth } from "@/libs/hooks/useAuth";

const PrivateRoute = () => {
  const { data: authUser, isLoading } = useAuth();
  useEffect(() => {}, [authUser]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!authUser) {
      navigate("/");
    }
  }, [isLoading]);

  return <Outlet />;
};

export default PrivateRoute;
