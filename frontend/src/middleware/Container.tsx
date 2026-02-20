import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
// ! hooks
import { useGuest, useAuth } from '@/hooks/apiHooks/useAuth';
import { useLoginModal } from '@/hooks/useLoginModal';
// ! modal
import { LoginFormModal } from '@/components/modal/LoginFormModal';
import { MenuModal } from '@/components/modal/MenuModal';

const Container = () => {
  const { data: isAuth } = useAuth();
  const { data: isGuest } = useGuest();
  const navigate = useNavigate();
  const { state: isShowLoginModal, showLoginModal, hideLoginModal } = useLoginModal();
  const { pathname } = useLocation();

  //? authコントロール
  useEffect(() => {
    const isAuthUndefined = isAuth === undefined || isGuest === undefined;
    if (isAuthUndefined) return;
    if (!isAuth && !isGuest && pathname !== '/identification/') {
      showLoginModal();
      navigate(ROUTE_PATH.HOME);
    } else {
      hideLoginModal();
    }
  }, [isAuth, isGuest, pathname]);

  return (
    <>
      <LoginFormModal isShow={isShowLoginModal} key={'LoginFormModal'} />

      <MenuModal />
      <Outlet />
    </>
  );
};

export default Container;
