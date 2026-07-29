import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { deviceState } from '@/store/deviceState';
import { HeaderAuthInfo } from './component/HeaderAuthInfo';
import { HeaderNavigation } from './component/HeaderNavigation';
import { HeaderView } from './component/HeaderView';
import { AdminMenuPopover } from './component/AdminMenuPopover';
import { SpAdminMenuPopover } from './component/SpAdminMenuPopover';
import { useHeaderHeightRef } from './hooks/useHeaderHeightRef';

export const Header = () => {
  const { pathname } = useLocation();
  const device = useRecoilValue(deviceState);
  const headerRef = useHeaderHeightRef();
  const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

  return (
    <HeaderView
      device={device}
      headerRef={headerRef}
      siteTitle={siteTitle}
      navigation={<HeaderNavigation pathname={pathname} />}
      adminMenu={device === 'PC' ? <AdminMenuPopover /> : <SpAdminMenuPopover />}
      authInfo={<HeaderAuthInfo />}
    />
  );
};
