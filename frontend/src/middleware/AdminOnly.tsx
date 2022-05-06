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
    if (authUser) {
      const { id, name, email } = authUser;
      if (id !== 2 || name !== "テラシマ" || email !== "terashima@test.com") {
        navigate("/");
        return;
      }
      return;
    }
  }, [isLoading]);
  return <Outlet />;
};

export default AdminOnly;
