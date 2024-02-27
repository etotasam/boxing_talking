import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
// ! components
import { Footer } from '@/components/module/Footer';
import { Header } from '@/components/module/Header';
// ! hooks
import { useLoading } from '@/hooks/useLoading';
import { useWindowSize } from '@/hooks/useWindowSize';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! image
import boxerImg from '@/assets/images/etc/boxerImg.jpg';
import clsx from 'clsx';

const HeaderAndFooterLayout = ({ children }: { children: React.ReactNode }) => {
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
      <Header />
      <Background>
        <div
          style={{
            minHeight: `calc(100vh - (${headerHeight}px + ${footerHeight}px) - 1px)`,
            marginTop: `${headerHeight}px`,
          }}
        >
          {children}
        </div>
        <Footer />
      </Background>
    </>
  );
};

export default HeaderAndFooterLayout;

const Background = ({ children }: { children: React.ReactNode }) => {
  const { device } = useWindowSize();
  return (
    <div
      className={clsx(
        'bg-fixed w-full h-[100vh]',
        device === 'PC' ? 'my-scroll-y' : 'overflow-auto'
      )}
      style={{
        backgroundImage: `url(${boxerImg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div
        className={clsx(
          'bg-fixed w-full h-[100vh] bg-neutral-900/70 backdrop-blur-[2px]',
          device === 'PC' ? 'my-scroll-y' : 'overflow-auto'
        )}
      >
        {children}
      </div>
    </div>
  );
};
