import { Outlet } from 'react-router-dom';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';

const AdminLayout = () => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  return (
    <main className="bg-white h-[100vh] overflow-auto" style={{ paddingTop: `${headerHeight}px` }}>
      {/* <div>{children}</div> */}
      <Outlet />
    </main>
  );
};

export default AdminLayout;
