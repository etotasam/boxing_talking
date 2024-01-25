// import React from "react";
import { useLocation } from 'react-router-dom';
// ! hooks
import { useAuth } from '@/hooks/apiHooks/useAuth';
// ! modules
import { Header } from './Header';

export const HeaderContainer = () => {
  // const { pathname } = useLocation();
  // console.log(pathname);
  const { data: userData } = useAuth();
  return (
    <>
      <Header userData={userData} />
    </>
  );
};
