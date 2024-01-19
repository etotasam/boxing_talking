import { ROUTE_PATH } from '@/assets/RoutePath';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
//! component
import { HeaderContainer } from '@/components/module/Header';
//! hooks
import { useAdmin } from '@/hooks/apiHooks/useAuth';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
// import { useFooterHeight } from '@/hooks/useFooterHeight';

const AdminOnly = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdmin();
  const { state: headerHeight } = useHeaderHeight();

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

  return (
    <>
      <HeaderContainer />
      <main
        style={{
          minHeight: `calc(100vh - ${headerHeight}px)`,
          marginTop: `${headerHeight}px`,
        }}
      >
        <Outlet />
      </main>
    </>
  );
};

export default AdminOnly;
