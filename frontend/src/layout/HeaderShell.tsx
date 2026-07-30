import { Outlet } from 'react-router-dom';
import { Header } from '@/components/module/Header';

const HeaderShell = () => {
  return (
    <>
      <Header />

      <Outlet />
    </>
  );
};

export default HeaderShell;
