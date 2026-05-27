import React from 'react';
import clsx from 'clsx';
import { ROUTE_PATH } from '@/constants/routePath';
import { Link } from 'react-router-dom';

import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';

const TermsLayout = ({ children }: { children: React.ReactNode }) => {

  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const footerHeight = useRecoilValue(elementSizeState('FOOTER_HEIGHT'));

  //? 初期設定(クリーンアップとか)
  //     resetLoadingState();

  return (
    <>
      <Header />
      <Background>
        <div
          style={{
            minHeight: `calc(100vh - (${headerHeight}px + ${footerHeight}px) - 1px)`,
            marginTop: `80px`,
          }}
        >
          {children}
        </div>
        {/* <Footer /> */}
      </Background>
    </>
  );
};

export default TermsLayout;

const Background = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={clsx('bg-fixed w-full h-[100vh] bg-neutral-100 text-stone-800 overflow-auto')}>
      {children}
      <Footer />
    </div>
  );
};

const Header = () => {
  return (
    <>
      <header
        style={{ width: `calc(100% - 10px)` }}
        className={clsx(
          'z-30 h-[80px] fixed top-0 left-0 flex justify-center bg-neutral-100/80 items-center backdrop-blur-sm text-stone-700'
        )}
      >
        <SiteTitle />
      </header>
    </>
  );
};

const SiteTitle = () => {
  const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;
  return (
    <h1 className={clsx('sm:text-[48px] text-[32px] font-thin')}>
      <Link to={ROUTE_PATH.HOME}>{siteTitle}</Link>
    </h1>
  );
};

const Footer = () => {
  return (
    <>
      <div className="relative w-full h-[50px] border-t-[1px] border-stone-500 text-stone-500">
        <div className="flex absolute bottom-2 right-10">
          <p className="pc:text-sm text-[8px] select-none">©2023 BOXING TALKING</p>
        </div>
      </div>
    </>
  );
};
