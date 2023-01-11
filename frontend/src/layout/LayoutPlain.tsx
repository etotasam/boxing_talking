import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { CustomLink } from "@/components/module/CustomLink";

const LayoutPlain = () => {
  return (
    <>
      <header className="bg-stone-800 h-[100px] flex justify-center items-center">
        <CustomLink to="/">
          <h1 className="text-white text-3xl">BOXING TALKING</h1>
        </CustomLink>
      </header>
      <main className={`min-h-[calc(100vh-150px)]`}>
        <Outlet />
      </main>
    </>
  );
};

export default LayoutPlain;
