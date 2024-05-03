import React, { useEffect } from 'react';
import clsx from 'clsx';
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
import topImg_1 from '@/assets/images/etc/boxerImg.jpg';
import manOnTheRing from '@/assets/images/etc/man_on_the_ring.jpg';
import boxingMatch from '@/assets/images/etc/boxing_match.jpg';

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
  const isPC = device === 'PC';
  return (
    <div
      className={clsx('bg-fixed w-full h-[100vh]', isPC ? 'my-scroll-y' : 'overflow-auto')}
      style={{
        backgroundImage: `url(${boxingMatch})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className={clsx(
          'bg-fixed w-full h-[100vh] bg-neutral-900/90 backdrop-blur-[1px]',
          device === 'PC' ? 'my-scroll-y' : 'overflow-auto'
        )}
      >
        {children}
      </div>
    </div>
  );
};
