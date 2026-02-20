import { Outlet } from 'react-router-dom';
// ! components
import { Header } from '@/components/module/Header';
import { Background } from '@/components/module/Background';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';

const HeaderLayout = () => {
  // ! use hook
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const footerHeight = useRecoilValue(elementSizeState('FOOTER_HEIGHT'));

  return (
    <>
      <Background />
      <Header />
      <main
        style={{
          paddingTop: `${headerHeight}px`,
        }}
      >
        <Outlet />
      </main>
    </>
  );
};

export default HeaderLayout;
