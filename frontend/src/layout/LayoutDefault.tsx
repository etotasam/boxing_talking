import { ReactNode } from "react";

export const LayoutDefault = ({ children }: { children: ReactNode }) => {
  return (
    <div className={`bg-stone-200 pt-[100px]`}>
      {/* //! HeaderはContainer */}
      <main className={`min-h-[calc(100vh-150px)]`}>{children}</main>
    </div>
  );
};
