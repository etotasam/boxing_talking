import { Background } from '@/components/module/Background';
import { Outlet } from 'react-router-dom';
import { Footer } from '@/components/module/Footer';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
const HeaderFooterLayout = () => {
  // ! use hook
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const footerHeight = useRecoilValue(elementSizeState('FOOTER_HEIGHT'));

  return (
    <>
      <Background />
      <main
        style={{
          minHeight: `calc(100vh - ${footerHeight}px)`,
          paddingTop: `${headerHeight}px`,
        }}
      >
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default HeaderFooterLayout;
