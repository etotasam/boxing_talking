import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { deviceState } from '@/store/deviceState';
import { HeaderAuthInfo } from './component/HeaderAuthInfo';
import { HeaderNavigation } from './component/HeaderNavigation';
import { HeaderView } from './component/HeaderView';
import { PcAdminPageNavigation } from './component/PcAdminPageNavigation';
import { SpAdminPageNavigation } from './component/SpAdminPageNavigation';
import { SpCommonMenuPopover } from './component/SpCommonMenuPopover';
import { useHeaderHeightRef } from './hooks/useHeaderHeightRef';
import { useAdmin } from '@/hooks/apiHooks/auth';

export const Header = () => {
  const { pathname } = useLocation();
  const device = useRecoilValue(deviceState);
  const headerRef = useHeaderHeightRef();
  const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;
  const { isAdmin, isFetching, isError } = useAdmin();
  const isAdminReady = isAdmin === true && !isFetching && !isError;

  return (
    <HeaderView
      device={device}
      headerRef={headerRef}
      siteTitle={siteTitle}
      navigation={<HeaderNavigation pathname={pathname} />}
      isAdmin={isAdminReady}
      adminNavigation={device === 'PC' ? <PcAdminPageNavigation /> : <SpAdminPageNavigation />}
      commonMenu={device === 'SP' ? <SpCommonMenuPopover /> : null}
      authInfo={<HeaderAuthInfo />}
    />
  );
};
