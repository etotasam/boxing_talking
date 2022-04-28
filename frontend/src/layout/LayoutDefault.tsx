import React, { ReactNode } from "react";

// components
import { Header } from "@/components/module/Header";

export const LayoutDefault = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid grid-cols-1 grid-rows-[100px_minmax(calc(100vh-150px),1fr)_50px]">
      <Header className="grid-rows-1 col-span-1" />
      <main className="grid-rows-1 col-span-1 bg-stone-200">{children}</main>
      <footer className="grid-rows-1 col-span-1 bg-stone-600">footer</footer>
    </div>
  );
};
