import { useCallback } from 'react';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
//! icon
import { AiOutlineUser } from 'react-icons/ai';
//! hooks
import { useGuest, useAuth } from '@/hooks/apiHooks/useAuth';
import { useAdmin } from '@/hooks/apiHooks/useAuth';
import { useLogout, useGuestLogout } from '@/hooks/apiHooks/useAuth';
//!recoil
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { deviceState } from '@/store/deviceState';
//! component
import { Link } from 'react-router-dom';
import { AdministratorPageLinks } from '../AdministratorPageLinks';
import { Hamburger } from './component/Hamburger';

export const Header = () => {
  const { pathname } = useLocation();
  const device = useRecoilValue(deviceState);

  const setHeaderHeight = useSetRecoilState(elementSizeState('HEADER_HEIGHT'));

  const headerRef = useCallback(
    (node: HTMLElement) => {
      if (node) {
        setHeaderHeight(node.clientHeight);
      }
    },
    [device]
  );

  return (
    <header
      ref={headerRef}
      className={clsx(
        'z-10 group w-full fixed top-0 left-0 backdrop-blur-md text-white',
        device === 'PC' && 'h-[80px]',
        device === 'SP' && 'h-[70px] bg-red-600'
      )}
    >
      {device === 'PC' && (
        <div className="h-[80px] group-hover:h-[90px] group-hover:bg-red-600 duration-500" />
      )}
      <div className="w-full fixed top-0 left-0 flex">
        <SiteTitle />
        {/* // TODO: widthを変更していくとデザインがずれる。修正 */}
        {device === 'PC' && <LinksComponent pathname={pathname} />}
        {device === 'SP' && <Hamburger />}
        <AuthInfo />
      </div>
    </header>
  );
};

const SiteTitle = () => {
  const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;
  return (
    <h1
      className={clsx(
        'pointer-events-none text-[24px] font-bold fixed left-[50%] translate-x-[-50%]',
        'pc:text-[38px] pc:static pc:left-0 pc:translate-x-0'
      )}
    >
      {siteTitle}
    </h1>
  );
};

const AuthInfo = () => <User />;

const User = () => {
  const device = useRecoilValue(deviceState);
  const { data: isGuest } = useGuest();
  const { data: authUser } = useAuth();
  const { logout } = useLogout();
  const { guestLogout } = useGuestLogout();

  if (!isGuest && !authUser) return;

  const userName = authUser ? authUser.name : 'ゲスト';
  const iconBgColor = authUser ? 'bg-cyan-700' : 'bg-stone-400';
  const handleLogout = authUser ? logout : guestLogout;

  return (
    <div className="absolute sm:top-1 top-2 pc:right-5 right-2 flex">
      <button
        type="button"
        onClick={handleLogout}
        className={clsx(
          'group/user relative flex items-center rounded-md text-[10px] transition-opacity',
          'hover:opacity-80 cursor-pointer'
        )}
      >
        <AiOutlineUser
          className={clsx(
            'mr-1 mt-[2px] block h-[16px] w-[16px] rounded-[50%] text-white',
            iconBgColor
          )}
        />
        <span>{userName}</span>
        {device === 'PC' && (
          <span
            className={clsx(
              'pointer-events-none absolute left-0 top-full mt-1',
              'whitespace-nowrap rounded-md bg-neutral-900 px-3 py-[6px] text-[10px] font-medium text-white shadow-lg',
              'after:absolute after:left-3 after:bottom-full after:h-0 after:w-0',
              'after:border-x-[6px] after:border-b-[6px] after:border-x-transparent after:border-b-neutral-900',
              'opacity-0 transition-opacity duration-200 group-hover/user:opacity-100'
            )}
          >
            ログアウト
          </span>
        )}
      </button>
    </div>
  );
};

const LINK_STYLES = {
  common: 'text-[14px] duration-300 px-4 py-1 rounded-[50px]',
  currentPage: 'text-black bg-yellow-400 pointer-events-none',
  normalPage: 'text-white hover:bg-gray-500/50 hover:scale-[110%]',
} as const;

const getLinkClassName = (targetPath: string, currentPath: string) =>
  clsx(
    LINK_STYLES.common,
    currentPath === targetPath ? LINK_STYLES.currentPage : LINK_STYLES.normalPage
  );

type LinksComponentsPropsType = {
  pathname: string;
};
const LinksComponent = ({ pathname }: LinksComponentsPropsType) => {
  const { isAdmin } = useAdmin();

  return (
    <>
      <ul className="absolute bottom-2 pc:static flex pc:items-end pc:mb-4">
        <li className="pc:ml-5 ml-2">
          <Link className={getLinkClassName(ROUTE_PATH.HOME, pathname)} to={ROUTE_PATH.HOME}>
            Schedule
          </Link>
        </li>

        <li className="pc:ml-5 ml-2">
          <Link
            className={getLinkClassName(ROUTE_PATH.PAST_MATCHES, pathname)}
            to={ROUTE_PATH.PAST_MATCHES}
          >
            Match Result
          </Link>
        </li>
        {isAdmin && (
          <li>
            <AdministratorPageLinks />
          </li>
        )}
      </ul>
    </>
  );
};
