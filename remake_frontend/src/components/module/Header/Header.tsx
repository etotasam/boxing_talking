import { useEffect, useRef } from 'react';
import clsx from 'clsx';
// ! icons
import { GiBoxingGlove } from 'react-icons/gi';
import { AiOutlineUser } from 'react-icons/ai'; // ! types
import { UserType } from '@/assets/types';
//! hooks
import { usePagePath } from '@/hooks/usePagePath';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import { useGuest, useAuth } from '@/hooks/useAuth';
//! component
import { Link } from 'react-router-dom';
import { LogoutButton } from '@/components/atomic/LogoutButton';
//! env
const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

type PropsType = {
  userData: UserType | undefined | null;
};

export const Header = (porps: PropsType) => {
  const { userData } = porps;
  const { data: isGuest } = useGuest();
  const { data: authUser } = useAuth();
  const isEitherAuth = Boolean(isGuest || authUser);
  const { state: pagePath } = usePagePath();

  const { setter: setHeader } = useHeaderHeight();

  const headerRef = useRef(null);
  useEffect(() => {
    if (!headerRef.current) return;
    const height = (headerRef.current as HTMLHeadElement).clientHeight;
    setHeader(height);
  }, [headerRef.current]);

  return (
    <>
      <header
        ref={headerRef}
        className="h-[80px] flex relative after:w-full after:absolute after:bottom-0 after:left-0 after:h-[3px] after:bg-red-500"
      >
        <h1 className="md:text-[64px] sm:text-[54px] text-[32px] select-none font-thin">
          {siteTitle}
        </h1>
        {pagePath !== '/' && (
          <div className="absolute bottom-2 left-2 sm:static sm:flex sm:items-end sm:mb-4 sm:ml-10">
            <ToBoxMatchLink />
          </div>
        )}
        {userData && (
          <div className="absolute top-2 sm:top-0 bottom-2 md:right-5 sm:right-2 right-1 flex">
            <AiOutlineUser className="mr-1 block bg-cyan-700 text-white mt-[2px] w-[16px] h-[16px] rounded-[50%]" />
            <p
              className={clsx(
                userData.name!.length > 20 ? 'text-[8px]' : 'text-sm'
              )}
            >
              {userData.name}
            </p>
          </div>
        )}
        {isGuest && (
          <div className="absolute top-2 sm:top-0 bottom-2 md:right-5 sm:right-2 right-1 flex">
            <AiOutlineUser className="mr-1 block bg-stone-400 text-white mt-[2px] w-[16px] h-[16px] rounded-[50%]" />
            <p className="text-sm">ゲストログイン</p>
          </div>
        )}
        {isEitherAuth && (
          <div className="absolute top-0 right-0 bg-red-300 h-full flex justify-center">
            <div className="absolute sm:bottom-5 bottom-3 lg:right-10 md:right-5 right-2 flex justify-center">
              <LogoutButton />
            </div>
          </div>
        )}
      </header>
    </>
  );
};

const ToBoxMatchLink = () => {
  return (
    <>
      <Link to="/">
        <div className="flex bg-stone-600 duration-300 lg:hover:bg-black rounded-[25px] text-white sm:px-3 sm:py-2 px-2 py-1 [&>span]:duration-300 [&>span]:rotate-[-40deg] lg:[&>span]:hover:rotate-[230deg]">
          <span className="text-[16px] sm:text-[18px] text-white mr-2">
            <GiBoxingGlove />
          </span>
          <p className="text-[10px] sm:text-sm">試合一覧</p>
        </div>
      </Link>
    </>
  );
};
