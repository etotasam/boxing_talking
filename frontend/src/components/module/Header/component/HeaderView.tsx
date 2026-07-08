import { ReactNode } from 'react';
import clsx from 'clsx';
import { DeviceStateType } from '@/store/deviceState';

type HeaderViewProps = {
  device: DeviceStateType;
  headerRef: (node: HTMLElement | null) => void;
  siteTitle: string;
  navigation: ReactNode;
  menuButton: ReactNode;
  authInfo: ReactNode;
};

export const HeaderView = ({
  device,
  headerRef,
  siteTitle,
  navigation,
  menuButton,
  authInfo,
}: HeaderViewProps) => {
  return (
    <header
      ref={headerRef}
      className={clsx(
        'z-10 group w-full fixed top-0 left-0 backdrop-blur-md text-white',
        device === 'PC' && 'h-[80px]',
        device === 'SP' && 'h-[126px] bg-black/95'
      )}
    >
      {device === 'PC' ? (
        <>
          <div className="h-[80px] group-hover:h-[90px] group-hover:bg-red-600 duration-500" />
          <div className="w-full fixed top-0 left-0 flex">
            <SiteTitle siteTitle={siteTitle} />
            {navigation}
            {authInfo}
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col">
          <div className="relative flex h-[70px] items-center border-b border-white/20 px-4">
            <SiteTitle siteTitle={siteTitle} />
            <div className="ml-auto flex items-center gap-5">
              {authInfo}
              {menuButton}
            </div>
          </div>
          <div className="h-[56px] border-b border-white/20">{navigation}</div>
        </div>
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
        'pointer-events-none fixed left-4 max-w-[calc(100vw-120px)] translate-x-0',
        'whitespace-nowrap text-[clamp(18px,6vw,24px)] font-bold',
        'pc:static pc:left-0 pc:max-w-none pc:text-[38px]'
      )}
    >
      {siteTitle}
    </h1>
  );
};
