// import React from "react";
import { Outlet } from 'react-router-dom';
//! component
import { HeaderContainer } from '@/components/module/Header';
const HeaderOnlyLayout = () => {
  return (
    <div className="text-stone-700 font-sans">
      <HeaderContainer />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default HeaderOnlyLayout;
