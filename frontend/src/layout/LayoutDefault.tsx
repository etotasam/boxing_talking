import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";

// components
import { Header } from "@/components/Header";

export const LayoutDefault = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid grid-cols-1 grid-rows-[100px_minmax(calc(100vh-150px),1fr)_50px]">
      <Header className="grid-rows-1 col-span-1" />
      <main className="grid-rows-1 col-span-1 bg-yellow-50">{children}</main>
      <footer className="grid-rows-1 col-span-1 bg-blue-200">footer</footer>
    </div>
  );
};
