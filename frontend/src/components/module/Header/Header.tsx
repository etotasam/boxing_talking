import { useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
import { motion } from 'framer-motion';
//! icon
import { IoLogOutSharp } from 'react-icons/io5';
import { GiBoxingGlove } from 'react-icons/gi';
import { AiOutlineUser } from 'react-icons/ai';
// ! types
import { UserType } from '@/types';
//! hooks
import { useGuest, useAuth } from '@/hooks/apiHooks/useAuth';
import { useMatchInfoModal } from '@/hooks/useMatchInfoModal';
import { useAdmin } from '@/hooks/apiHooks/useAuth';
import { useLogout, useGuestLogout } from '@/hooks/apiHooks/useAuth';
import { useMenuModal } from '@/hooks/useMenuModal';
//!recoil
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { deviceState } from '@/store/deviceState';
//! component
import { Link } from 'react-router-dom';
import { LogoutButton } from '@/components/atomic/LogoutButton';
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

const AuthInfo = () => {
  const device = useRecoilValue(deviceState);
  const { state: isShowMenu } = useMenuModal();
  return (
    <>
      <UserName />
      <LogoutBox isShow={device === 'PC'} />
      <LogoutIcon isShow={isShowMenu} />
    </>
  );
};

const LogoutBox = ({ isShow }: { isShow: boolean }) => {
  const { data: isGuest } = useGuest();
  const { data: authUser } = useAuth();

  const isShowCondition = isShow && (isGuest || authUser);
  return (
    <>
      {isShowCondition && (
        <div className="absolute sm:bottom-5 bottom-3 pc:right-10 right-2 flex justify-center">
          <LogoutButton />
        </div>
      )}
    </>
  );
};

const UserName = () => {
  const { data: isGuest } = useGuest();
  const { data: authUser } = useAuth();

  if (!isGuest && !authUser) return;

  return (
    <div className="absolute sm:top-1 top-2 pc:right-5 right-2 flex">
      {authUser ? <UserIcon userData={authUser} /> : isGuest && <GuestIcon />}
    </div>
  );
};

const UserIcon = ({ userData }: { userData: UserType | undefined | null }) => {
  if (!userData) return;
  return (
    <>
      <p className={clsx('text-[10px] flex items-center')}>
        <AiOutlineUser className="mr-1 block bg-cyan-700 text-white mt-[2px] w-[16px] h-[16px] rounded-[50%]" />
        {userData.name}
      </p>
    </>
  );
};

const GuestIcon = () => {
  return (
    <>
      <p className="text-[10px] flex items-center">
        <AiOutlineUser className="mr-1 block bg-stone-400 text-white mt-[2px] w-[16px] h-[16px] rounded-[50%]" />
        ゲスト
      </p>
    </>
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
  const device = useRecoilValue(deviceState);
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

        {device === 'SP' &&
          (pathname === ROUTE_PATH.MATCH || pathname === ROUTE_PATH.PAST_MATCH_SINGLE) && (
            <li className="pc:ml-5 ml-2">
              <ViewMatchInfoButton />
            </li>
          )}

        {isAdmin && (
          <li>
            <AdministratorPageLinks />
          </li>
        )}
      </ul>
    </>
  );
};

const ViewMatchInfoButton = () => {
  const { viewMatchInfoModal, hideMatchInfoModal } = useMatchInfoModal();

  //コンポーネントが非表示になるタイミングでmodalも非表示にする
  useEffect(() => {
    return () => {
      hideMatchInfoModal();
    };
  }, []);

  return (
    <>
      <LinkButton
        onClick={() => viewMatchInfoModal()}
        className={'rotate-[-40deg] pc:hover:rotate-[240deg]'}
      >
        <GiBoxingGlove />
      </LinkButton>
    </>
  );
};

type LinkButtonPropsType = React.ComponentProps<'button'>;
const LinkButton = ({
  children,
  onMouseEnter,
  onMouseLeave,
  className,
  onClick,
}: LinkButtonPropsType) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={clsx(
        'sm:w-[40px] sm:h-[40px] w-[30px] h-[30px] bg-stone-600 hover:bg-black rounded-[50%] flex justify-center items-center text-white text-[16px] hover:text-[18px] duration-300',
        className
      )}
    >
      {children}
    </button>
  );
};

const LogoutIcon = ({ isShow }: { isShow: boolean }) => {
  const { logout } = useLogout();
  const { guestLogout } = useGuestLogout();
  const { data: authUser } = useAuth();
  const { data: isGuest } = useGuest();

  const userLogout = () => {
    if (authUser) {
      logout();
      return;
    }
    if (isGuest) {
      guestLogout();
      return;
    }
  };

  if (!isShow) return;
  return (
    <motion.button
      onClick={userLogout}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-[50px] right-2 flex items-center text-[8px] px-[3px] py-[2px] bg-neutral-800 text-neutral-400"
    >
      <IoLogOutSharp className={'text-xl mr-1'} />
      ログアウト
    </motion.button>
  );
};
