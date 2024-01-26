import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
// ! components
import { Footer } from '@/components/module/Footer';
import { HeaderContainer } from '@/components/module/Header';
// ! hooks
import { useLoading } from '@/hooks/useLoading';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';

const HeaderAndFooterLayout = () => {
  // ! use hook
  const { resetLoadingState } = useLoading();

  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const footerHeight = useRecoilValue(elementSizeState('FOOTER_HEIGHT'));

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    return () => {
      resetLoadingState();
    };
  }, []);

  return (
    <>
      <HeaderContainer />
      <div
        className={`relative`}
        style={{
          minHeight: `calc(100vh - (${headerHeight}px + ${footerHeight}px) - 1px)`,
          marginTop: `${headerHeight}px`,
        }}
      >
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default HeaderAndFooterLayout;
