import React, { ReactNode } from "react";

// components
// import { EditHeader } from "@/components/module/EditHeader";

export const LayoutForEditPage = ({ children }: { children?: ReactNode }) => {
  return (
    <div>
      {/* <EditHeader className="grid-rows-1 col-span-1" /> */}
      <main>{children}</main>
    </div>
  );
};
