import { ReactNode } from 'react';
import clsx from 'clsx';
import { DeviceStateType } from '@/store/deviceState';

type HeaderViewProps = {
  device: DeviceStateType;
  headerRef: (node: HTMLElement | null) => void;
  siteTitle: string;
  navigation: ReactNode;
  adminMenu: ReactNode;
  authInfo: ReactNode;
};

export const HeaderView = ({
  device,
  headerRef,
  siteTitle,
  navigation,
  adminMenu,
  authInfo,
}: HeaderViewProps) => {
  return (
    <header
      ref={headerRef}
      className={clsx(
        'z-10 w-full fixed top-0 left-0 backdrop-blur-md text-white',
        device === 'PC' && 'h-[80px] border-b border-white/20 bg-black/95',
        device === 'SP' && 'h-[126px] bg-black/95'
      )}
    >
      {device === 'PC' ? (
        <HeaderContentPC
          siteTitle={siteTitle}
          navigation={navigation}
          adminMenu={adminMenu}
          authInfo={authInfo}
        />
      ) : (
        <HeaderContentSP
          siteTitle={siteTitle}
          navigation={navigation}
          authInfo={authInfo}
          adminMenu={adminMenu}
        />
      )}
    </header>
  );
};

type SiteTitleProps = {
  siteTitle: string;
};

const SiteTitle = ({ siteTitle }: SiteTitleProps) => {
  return (
    <h1
      className={clsx(
        'pointer-events-none min-w-0 flex-1 truncate',
        "font-['Bebas_Neue'] text-[clamp(36px,7vw,48px)] font-normal tracking-[0.04em]",
        'pc:flex-none pc:max-w-[clamp(180px,32vw,360px)] pc:overflow-hidden pc:text-[clamp(32px,4.8vw,48px)]'
      )}
    >
      {siteTitle}
    </h1>
  );
};

const HeaderContentPC = ({
  siteTitle,
  navigation,
  adminMenu,
  authInfo,
}: Pick<HeaderViewProps, 'siteTitle' | 'navigation' | 'adminMenu' | 'authInfo'>) => {
  return (
    <div className="flex h-full w-full items-center px-[clamp(12px,2.5vw,24px)]">
      <div className="flex h-full min-w-0 flex-1 items-center">
        <SiteTitle siteTitle={siteTitle} />
        {navigation}
      </div>
      <div className="ml-[clamp(8px,1.5vw,12px)] flex min-w-0 items-center gap-[clamp(8px,1.5vw,12px)]">
        {adminMenu}
        {authInfo}
      </div>
    </div>
  );
};

const HeaderContentSP = ({
  siteTitle,
  navigation,
  authInfo,
  adminMenu,
}: Pick<HeaderViewProps, 'siteTitle' | 'navigation' | 'authInfo' | 'adminMenu'>) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[70px] items-center gap-2 border-b border-white/20 px-4">
        <SiteTitle siteTitle={siteTitle} />
        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-5">
          <div className="min-w-0">{authInfo}</div>
        </div>
      </div>
      <div className="flex h-[56px] items-center border-b border-white/20">
        <div className="min-w-0 flex-1">{navigation}</div>
        <div className="flex h-full shrink-0 items-center">{adminMenu}</div>
      </div>
    </div>
  );
};
