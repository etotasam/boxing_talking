import React from "react";
import { useRecoilValue } from "recoil";
import { loginModalSelector } from "@/store/loginModalState";
// ! modules
import { Header } from "./Header";

export const HeaderContainer = () => {
  const isShowLoginModal = useRecoilValue(loginModalSelector);

  return (
    <>
      <Header isShowLoginModal={isShowLoginModal} />
    </>
  );
};
