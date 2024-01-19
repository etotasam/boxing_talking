import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
// ! components
import { Footer } from '@/components/module/Footer';
import { HeaderContainer } from '@/components/module/Header';
// ! hooks
import { useLoading } from '@/hooks/useLoading';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import { useFooterHeight } from '@/hooks/useFooterHeight';

const HeaderAndFooterLayout = () => {
  // ! use hook
  const { resetLoadingState } = useLoading();

  const { state: headerHeight } = useHeaderHeight();
  const { state: footerHeight } = useFooterHeight();

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
