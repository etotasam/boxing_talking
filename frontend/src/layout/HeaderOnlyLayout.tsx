// import React from "react";
import { Outlet } from 'react-router-dom';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';

//! component
import { HeaderContainer } from '@/components/module/Header';
const HeaderOnlyLayout = () => {
  const { state: headerHeight } = useHeaderHeight();
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
