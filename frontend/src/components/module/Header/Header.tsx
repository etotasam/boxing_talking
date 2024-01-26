import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/RoutePath';
// ! icons
import { BsCalendar3 } from 'react-icons/bs';
import { GiBoxingGlove } from 'react-icons/gi';
import { AiOutlineUser } from 'react-icons/ai';
import { RiTimeLine } from 'react-icons/ri';
// ! types
import { UserType } from '@/assets/types';
//! hooks
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import { useGuest, useAuth } from '@/hooks/apiHooks/useAuth';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useMatchInfoModal } from '@/hooks/useMatchInfoModal';
//! component
import { Link } from 'react-router-dom';
import { LogoutButton } from '@/components/atomic/LogoutButton';
import { AdministratorPageLinks } from '../AdministratorPageLinks';
//! env
const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

type PropsType = {
  userData: UserType | undefined | null;
};

export const Header = (props: PropsType) => {
  const { userData } = props;
  const { data: isGuest } = useGuest();
  const { data: authUser } = useAuth();
  const { pathname } = useLocation();
  const { device } = useWindowSize();

  const { setter: setHeaderHeight } = useHeaderHeight();

  const headerRef = useRef(null);
  useEffect(() => {
    if (!headerRef.current) return;
    const height = (headerRef.current as HTMLHeadElement).clientHeight;
    setHeaderHeight(height);
  }, [headerRef.current]);

  return (
    <>
      <header
        ref={headerRef}
        className="z-10 h-[80px] fixed top-0 left-0 w-full flex bg-white after:w-full after:absolute after:bottom-0 after:left-0 after:h-[3px] after:bg-red-500"
      >
        <h1
          className={clsx(
            'sm:text-[48px] text-[32px] font-thin',
            device === 'PC' && 'md:text-[64px]'
          )}
        >
          {siteTitle}
        </h1>

        <LinksComponents pathname={pathname} />

        <UserName userData={userData} />

        {Boolean(isGuest || authUser) && (
          <div className="absolute sm:bottom-5 bottom-3 lg:right-10 md:right-5 right-2 flex justify-center">
            <LogoutButton />
          </div>
        )}
      </header>
    </>
  );
};

const UserName = ({ userData }: { userData: UserType | undefined | null }) => {
  const { data: isGuest } = useGuest();
  return (
    <div className="absolute sm:top-1 top-2 lg:right-10 md:right-5 right-2 flex">
      {userData && (
        <>
          <AiOutlineUser className="mr-1 block bg-cyan-700 text-white mt-[2px] w-[16px] h-[16px] rounded-[50%]" />
          <p
            className={clsx(
              userData.name!.length > 20
                ? 'sm:text-[16px] text-xs'
                : 'sm:text-[18px] text-sm'
            )}
          >
            {userData.name}
          </p>
        </>
      )}
      {isGuest && (
        <>
          <AiOutlineUser className="mr-1 block bg-stone-400 text-white mt-[2px] w-[16px] h-[16px] rounded-[50%]" />
          <p className="text-sm">ゲストログイン</p>
        </>
      )}
    </div>
  );
};

type LinksComponentsPropsType = {
  pathname: string;
};
const LinksComponents = ({ pathname }: LinksComponentsPropsType) => {
  const { device } = useWindowSize();

  return (
    <>
      <ul className="absolute bottom-2 sm:static flex sm:items-end md:mb-2 sm:mb-4">
        {pathname !== ROUTE_PATH.HOME && (
          <li className="md:ml-5 ml-2">
            <ToBoxMatchLinkButton device={device} />
          </li>
        )}

        {pathname == ROUTE_PATH.PAST_MATCH_SINGLE && (
          <li className="md:ml-5 ml-2">
            <ToPastMatchesPageLinkButton device={device} />
          </li>
        )}

        {device === 'SP' &&
          (pathname === ROUTE_PATH.MATCH ||
            pathname === ROUTE_PATH.PAST_MATCH_SINGLE) && (
            <li className="md:ml-5 ml-2">
              <ViewMatchInfoButton />
            </li>
          )}

        <li>
          <AdministratorPageLinks />
        </li>
      </ul>
    </>
  );
};

const ToBoxMatchLinkButton = (props: { device: 'PC' | 'SP' | undefined }) => {
  const [isShowDescription, setIsShowDescription] = useState(false);

  return (
    <>
      <div className="relative">
        {isShowDescription && (
          <div className="absolute top-[-22px] left-0 w-[60px] text-center py-[1px] select-none bg-white/90 border-[1px] border-stone-400 rounded-md text-xs">
            <p>試合一覧</p>
          </div>
        )}
        <Link to={ROUTE_PATH.HOME}>
          <LinkButton
            onMouseEnter={
              props.device === 'PC'
                ? () => setIsShowDescription(true)
                : () => {}
            }
            onMouseLeave={
              props.device === 'PC'
                ? () => setIsShowDescription(false)
                : () => {}
            }
          >
            <BsCalendar3 />
          </LinkButton>
        </Link>
      </div>
    </>
  );
};

const ToPastMatchesPageLinkButton = (props: {
  device: 'PC' | 'SP' | undefined;
}) => {
  const [isShowDescription, setIsShowDescription] = useState(false);

  return (
    <>
      <div className="relative">
        {isShowDescription && (
          <div className="absolute top-[-22px] left-0 w-[100px] text-center py-[1px] select-none bg-white/90 border-[1px] border-stone-400 rounded-md text-xs">
            <p>過去の試合一覧</p>
          </div>
        )}
        <Link to={ROUTE_PATH.PAST_MATCHES}>
          <LinkButton
            className="text-[20px] hover:text-[22px]"
            onMouseEnter={
              props.device === 'PC'
                ? () => setIsShowDescription(true)
                : () => {}
            }
            onMouseLeave={
              props.device === 'PC'
                ? () => setIsShowDescription(false)
                : () => {}
            }
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
        'sm:w-[35px] sm:h-[35px] w-[30px] h-[30px] bg-stone-600 rounded-[50%] flex justify-center items-center text-white text-[16px] hover:text-[18px] duration-100',
        className
      )}
    >
      {children}
    </button>
  );
};
