// import React from "react";
import { Outlet } from 'react-router-dom';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! component
import { HeaderContainer } from '@/components/module/Header';
const HeaderOnlyLayout = () => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  return (
    <div className="text-stone-700 font-sans">
      <HeaderContainer />
      <main
        style={{
          minHeight: `calc(100vh - (${headerHeight}px)`,
          marginTop: `${headerHeight}px`,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default HeaderOnlyLayout;
