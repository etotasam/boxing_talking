import { Outlet } from 'react-router-dom';
// ! components
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
