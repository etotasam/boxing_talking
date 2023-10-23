import { ROUTE_PATH } from '@/assets/RoutePath';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

//! hooks
import { useAdmin } from '@/hooks/useAuth';
// import { useLogout } from "@/hooks/useAuth";

const AdminOnly = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdmin();

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) return navigate(ROUTE_PATH.HOME);
  }, [isAdmin, isLoading]);

  if (isLoading)
    return (
      <div className="w-[100vw] h-[100vh] flex justify-center items-center">
        <div>Loding...</div>
      </div>
    );

  return <Outlet />;
};

export default AdminOnly;
