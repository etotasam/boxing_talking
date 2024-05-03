import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
import { motion, AnimatePresence } from 'framer-motion';
//! icon
import { IoLogOutSharp } from 'react-icons/io5';
import { BsCalendar3 } from 'react-icons/bs';
import { GiBoxingGlove } from 'react-icons/gi';
import { AiOutlineUser } from 'react-icons/ai';
import { RiTimeLine } from 'react-icons/ri';
// ! types
import { UserType } from '@/assets/types';
//! hooks
import { useGuest, useAuth } from '@/hooks/apiHooks/useAuth';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useMatchInfoModal } from '@/hooks/useMatchInfoModal';
import { useAdmin } from '@/hooks/apiHooks/useAuth';
import { useLogout, useGuestLogout } from '@/hooks/apiHooks/useAuth';
import { useMenuModal } from '@/hooks/useMenuModal';
//!recoil
import { useSetRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! component
import { Link } from 'react-router-dom';
import { LogoutButton } from '@/components/atomic/LogoutButton';
import { AdministratorPageLinks } from '../AdministratorPageLinks';
import { Hamburger } from './component/Hamburger';

export const Header = () => {
  const { pathname } = useLocation();
  const { device } = useWindowSize();

  const setHeaderHeight = useSetRecoilState(elementSizeState('HEADER_HEIGHT'));

  const headerRef = useCallback((node: HTMLElement) => {
    if (node) {
      setHeaderHeight(node.clientHeight);
    }
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        style={device === 'SP' ? { width: `100%` } : { width: `calc(100% - 10px)` }}
        className={clsx('z-10 h-[80px] fixed top-0 left-0 flex backdrop-blur-sm text-stone-200')}
      >
        <SiteTitle />

        {device === 'PC' && <LinksComponent pathname={pathname} />}
        {device === 'SP' && <Hamburger />}

        <AuthInfo />
      </header>
    </>
  );
};

const SiteTitle = () => {
  const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;
  return <h1 className={clsx('shadow-blur sm:text-[48px] text-[32px] font-thin')}>{siteTitle}</h1>;
};

const AuthInfo = () => {
  const { device } = useWindowSize();
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
        <div className="absolute sm:bottom-5 bottom-3 lg:right-10 md:right-5 right-2 flex justify-center">
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
    <div className="absolute sm:top-1 top-2 lg:right-10 md:right-5 right-2 flex">
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

type LinksComponentsPropsType = {
  pathname: string;
};
const LinksComponent = ({ pathname }: LinksComponentsPropsType) => {
  const { device } = useWindowSize();
  const { isAdmin } = useAdmin();

  return (
    <>
      <ul className="absolute bottom-2 sm:static flex sm:items-end sm:mb-4">
        {pathname !== ROUTE_PATH.HOME && (
          <li className="md:ml-5 ml-2">
            <ToBoxMatchLinkButton />
          </li>
        )}

        {pathname !== ROUTE_PATH.PAST_MATCHES && (
          <li className="md:ml-5 ml-2">
            <ToPastMatchesPageLinkButton />
          </li>
        )}

        {device === 'SP' &&
          (pathname === ROUTE_PATH.MATCH || pathname === ROUTE_PATH.PAST_MATCH_SINGLE) && (
            <li className="md:ml-5 ml-2">
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

const ToBoxMatchLinkButton = () => {
  const [isShowDescription, setIsShowDescription] = useState(false);
  const { device } = useWindowSize();

  return (
    <>
      <div className="relative">
        {isShowDescription && (
          <div className="absolute top-[-22px] left-0 w-[60px] text-center py-[1px] select-none bg-white/90 text-stone-700 rounded-md text-xs">
            <p>試合一覧</p>
          </div>
        )}
        <Link to={ROUTE_PATH.HOME}>
          <LinkButton
            onMouseEnter={device === 'PC' ? () => setIsShowDescription(true) : () => {}}
            onMouseLeave={device === 'PC' ? () => setIsShowDescription(false) : () => {}}
          >
            <BsCalendar3 />
          </LinkButton>
        </Link>
      </div>
    </>
  );
};

const ToPastMatchesPageLinkButton = () => {
  const [isShowDescription, setIsShowDescription] = useState(false);
  const { device } = useWindowSize();

  return (
    <>
      <div className="relative">
        {isShowDescription && (
          <div className="absolute top-[-22px] left-0 w-[100px] text-center py-[1px] select-none bg-white/90 text-stone-700 rounded-md text-xs">
            <p>過去の試合一覧</p>
          </div>
        )}
        <Link to={ROUTE_PATH.PAST_MATCHES}>
          <LinkButton
            className="text-[20px] hover:text-[22px]"
            onMouseEnter={device === 'PC' ? () => setIsShowDescription(true) : () => {}}
            onMouseLeave={device === 'PC' ? () => setIsShowDescription(false) : () => {}}
          >
            <RiTimeLine />
          </LinkButton>
        </Link>
      </div>
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
        className={'rotate-[-40deg] md:hover:rotate-[240deg]'}
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
    }
    if (isGuest) {
      guestLogout();
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
