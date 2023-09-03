import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

//! hooks
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useAuth";

const AdminOnly = () => {
  const navigate = useNavigate();
  const { data: authUser, isLoading } = useAuth();
  const { isSuccess: isLogout } = useLogout();
  // const { setter: setIsOpenHamburgerMenu } = useQueryState<boolean>("q/isOpenHamburgerMenu");
  // useEffect(() => {
  //   setIsOpenHamburgerMenu(false);
  // }, [isLogout]);

  useEffect(() => {
    if (isLoading) return;
    if (!authUser) return navigate("/");
    // if (!authUser.administrator) return navigate("/");
  }, [isLoading, authUser]);
  return <Outlet />;
};

export default AdminOnly;
