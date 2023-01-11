import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/module/Header";

const LayoutDefault = () => {
  return (
    <div className={`bg-stone-200 pt-[100px]`}>
      <Header />
      {/* //! HeaderはContainer */}
      <main className={`min-h-[calc(100vh-150px)]`}>
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutDefault;
