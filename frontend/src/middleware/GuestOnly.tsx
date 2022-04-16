import { Outlet, useNavigate } from "react-router-dom";
import { AuthIs } from "@/store/slice/authUserSlice";
import { useAuth } from "@/libs/hooks/useAuth";
import { useEffect } from "react";

const GuestOnly = () => {
  const navigate = useNavigate();
  const {
    authState: { hasAuth, pending },
  } = useAuth();

  useEffect(() => {
    if (hasAuth === AuthIs.TRUE) return navigate("/");
    if (hasAuth === AuthIs.FALSE) return;
  }, [pending]);

  return pending ? <div>loading test...</div> : <Outlet />;
};

export default GuestOnly;
