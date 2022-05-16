import React, { ReactNode } from "react";

// components
import { EditHeader } from "@/components/module/EditHeader";

export const LayoutForEditPage = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="w-[99vw] grid grid-cols-1 grid-rows-[50px_minmax(calc(100vh-50px),1fr)]">
      <EditHeader className="grid-rows-1 col-span-1" />
      <main className="grid-rows-1 col-span-1 bg-stone-300 mt-[50px]">{children}</main>
    </div>
  );
};
