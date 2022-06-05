import React, { ReactNode } from "react";
import { useQueryState } from "@/libs/hooks/useQueryState";
import { motion, useAnimation, AnimationControls, AnimatePresence } from "framer-motion";
//! components
import { Header } from "@/components/module/Header";

export const LayoutDefault = ({ children }: { children: ReactNode }) => {
  const { state: isOpenHamburgerMenu, setter: setIsOpenHamburgerMenu } =
    useQueryState<boolean>("q/isOpenHamburgerMenu");
  return (
    // <div className="grid grid-cols-[100%] grid-rows-[minmax(calc(100vh-50px),1fr)_50px]">
    <div className={`bg-stone-200 pt-[100px]`}>
      {/* //! HeaderはContainerに入れてます */}
      {/* <Header className="grid-rows-1" /> */}
      <main className={`min-h-[calc(100vh-150px)]`}>{children}</main>
      <footer className="h-[50px] bg-stone-200 border-t border-stone-300 text-center">
        ©footer
      </footer>
    </div>
  );
};
