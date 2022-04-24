import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthIs } from "@/store/slice/authUserSlice";

//! hooks
import { useAuth } from "@/libs/hooks/useAuth";

const AdminOnly = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  useEffect(() => {
    if (authState.hasAuth === AuthIs.FALSE) return navigate("/");
    if (authState.hasAuth === AuthIs.TRUE) {
      const { id, name, email } = authState.user;
      if (id !== 2 || name !== "テラシマ" || email !== "terashima@test.com") {
        navigate("/");
        return;
      }
      return;
    }
  }, [authState.hasAuth]);
  return <Outlet />;
};

export default AdminOnly;
