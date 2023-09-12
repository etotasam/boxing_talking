// import React from "react";
// ! hooks
import { useAuth } from "@/hooks/useAuth";
// ! modules
import { Header } from "./Header";

export const HeaderContainer = () => {
  const { data: userData } = useAuth();
  return (
    <>
      <Header userData={userData} />
    </>
  );
};
