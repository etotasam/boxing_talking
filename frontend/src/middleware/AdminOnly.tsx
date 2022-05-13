import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

//! hooks
import { useAuth } from "@/libs/hooks/useAuth";

const AdminOnly = () => {
  const navigate = useNavigate();
  const { data: authUser, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!authUser) return navigate("/");
    if (!authUser.administrator) return navigate("/");
  }, [isLoading]);
  return <Outlet />;
};

export default AdminOnly;
