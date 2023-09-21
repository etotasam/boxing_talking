import { useEffect, ReactNode } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
// ! components
import { Footer } from '@/components/module/Footer';
import { HeaderContainer } from '@/components/module/Header';
// ! hooks
import { usePagePath } from '@/hooks/usePagePath';
import { useLoading } from '@/hooks/useLoading';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import { useFooterHeight } from '@/hooks/useFooterHeight';

const HeaderAndFooterLayout = () => {
  // ! use hook
  const { resetLoadingState } = useLoading();
  const { setter: setPagePath } = usePagePath();
  const { pathname } = useLocation();

  const { state: headerHeight } = useHeaderHeight();
  const { state: footerHeight } = useFooterHeight();

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    //? ページpathをRecoilに保存
    setPagePath(pathname);
    return () => {
      resetLoadingState();
    };
  }, []);

  return (
    <>
      <HeaderContainer />
      <div
        className="relative"
        style={{
          minHeight: `calc(100vh - (${headerHeight}px + ${footerHeight}px) - 1px)`,
        }}
      >
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default HeaderAndFooterLayout;
