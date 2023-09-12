// import React from "react";
import { Outlet } from "react-router-dom";
//! component
import { HeaderContainer } from "@/components/module/Header";
const MainLayout = () => {
  return (
    <div className="text-stone-700 font-sans">
      <HeaderContainer />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
