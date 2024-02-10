import { ROUTE_PATH } from '@/assets/RoutePath';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
//! component
import { HeaderContainer } from '@/components/module/Header';
//! hooks
import { useAdmin } from '@/hooks/apiHooks/useAuth';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';

const AdminOnly = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdmin();
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

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
