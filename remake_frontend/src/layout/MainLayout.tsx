import React from "react";
import { Outlet } from "react-router-dom";
//! component
import { HeaderContainer } from "@/components/module/Header";

const MainLayout = React.memo(() => {
  return (
    <div className="text-stone-700">
      <HeaderContainer />
      <main>
        <Outlet />
      </main>
    </div>
  );
});

export default MainLayout;
