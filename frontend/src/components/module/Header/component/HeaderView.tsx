import { ReactNode, RefObject } from 'react';
import clsx from 'clsx';
import { DeviceStateType } from '@/store/deviceState';

type HeaderViewProps = {
  device: DeviceStateType;
  headerRef: RefObject<HTMLElement>;
  siteTitle: string;
  navigation: ReactNode;
  isAdmin: boolean;
  adminNavigation: ReactNode;
  commonMenu: ReactNode;
  authInfo: ReactNode;
};

export const HeaderView = ({
  device,
  headerRef,
  siteTitle,
  navigation,
  isAdmin,
  adminNavigation,
  commonMenu,
  authInfo,
}: HeaderViewProps) => {
  return (
    <header
      ref={headerRef}
      className={clsx(
        'z-10 w-full fixed top-0 left-0 backdrop-blur-md text-white',
        device === 'PC' &&
          (isAdmin
            ? 'h-[132px] border-b border-white/20 bg-black/95'
            : 'h-[80px] border-b border-white/20 bg-black/95'),
        device === 'SP' && 'h-[126px] bg-black/95'
      )}
    >
      {device === 'PC' ? (
        <HeaderContentPC
          siteTitle={siteTitle}
          navigation={navigation}
          isAdmin={isAdmin}
          adminNavigation={adminNavigation}
          authInfo={authInfo}
        />
      ) : (
        <HeaderContentSP
          siteTitle={siteTitle}
          navigation={navigation}
          authInfo={authInfo}
          isAdmin={isAdmin}
          adminNavigation={adminNavigation}
          commonMenu={commonMenu}
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
  isAdmin,
  adminNavigation,
  authInfo,
}: Pick<
  HeaderViewProps,
  'siteTitle' | 'navigation' | 'isAdmin' | 'adminNavigation' | 'authInfo'
>) => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-[80px] w-full items-center border-b border-white/20 px-[clamp(12px,2.5vw,24px)]">
        <div className="flex h-full min-w-0 flex-1 items-center">
          <SiteTitle siteTitle={siteTitle} />
          {navigation}
        </div>
        <div className="ml-[clamp(8px,1.5vw,12px)] flex min-w-0 items-center gap-[clamp(8px,1.5vw,12px)]">
          {authInfo}
        </div>
      </div>
      {isAdmin && <div className="h-[52px] w-full border-b border-white/20">{adminNavigation}</div>}
    </div>
  );
};

const HeaderContentSP = ({
  siteTitle,
  navigation,
  authInfo,
  isAdmin,
  adminNavigation,
  commonMenu,
}: Pick<
  HeaderViewProps,
  'siteTitle' | 'navigation' | 'authInfo' | 'isAdmin' | 'adminNavigation' | 'commonMenu'
>) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[70px] items-center gap-2 border-b border-white/20 px-4">
        <SiteTitle siteTitle={siteTitle} />
        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-5">
          <div className="min-w-0">{authInfo}</div>
        </div>
      </div>
      <div className="grid h-[56px] grid-cols-5 items-center border-b border-white/20">
        {isAdmin ? (
          <>
            <div className="col-span-4 min-w-0">{adminNavigation}</div>
            <div className="col-span-1 flex h-full min-w-0 items-center">{commonMenu}</div>
          </>
        ) : (
          <div className="col-span-5 min-w-0">{navigation}</div>
        )}
      </div>
    </div>
  );
};
