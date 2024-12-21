// import React from "react";
import { Outlet } from 'react-router-dom';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! component
import { Header } from '@/components/module/Header';
const HeaderOnlyLayout = ({ children }: { children: React.ReactNode }) => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  return (
    <div className="text-stone-700">
      <Header />
      <main
        style={{
          minHeight: `calc(100vh - (${headerHeight}px)`,
        }}
      >
        {/* <Outlet /> */}
        {children}
      </main>
    </div>
  );
};

export default HeaderOnlyLayout;
