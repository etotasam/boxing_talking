import { ROUTE_PATH } from '@/constants/routePath';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/apiHooks/auth';

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
        <div>Loading...</div>
      </div>
    );

  return <Outlet />;
};

export default AdminOnly;
