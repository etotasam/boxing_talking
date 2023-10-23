// import React, { ReactNode, useEffect } from "react";
import { ROUTE_PATH } from '@/assets/RoutePath';
import { Link } from 'react-router-dom';
//! hooks
import { usePagePath } from '@/hooks/usePagePath';

const linksArray = [
  { pathName: 'Home', path: ROUTE_PATH.HOME },
  { pathName: 'ボクサー登録', path: ROUTE_PATH.BOXER_REGISTER },
  { pathName: 'ボクサー編集', path: ROUTE_PATH.BOXER_EDIT },
  { pathName: '試合登録', path: ROUTE_PATH.MATCH_REGISTER },
  { pathName: '試合編集', path: ROUTE_PATH.MATCH_EDIT },
] as const;

export const AdministratorPageLinks = () => {
  const { state: pagePath } = usePagePath();
  // const currentPage = location.pathname;

  return (
    <div className="flex justify-center items-center h-[100px] w-full">
      <ul className="flex">
        {linksArray.map((link) => (
          <li key={`${link.pathName}_${link.path}`} className="mr-5">
            {pagePath === link.path ? (
              <button className="bg-black/60 duration-300 text-white text-sm rounded-md px-6 py-2 cursor-auto">
                {link.pathName}
              </button>
            ) : (
              <Link to={link.path}>
                <button className="bg-black/80 md:hover:bg-black/60 duration-300 text-white text-sm rounded-md px-6 py-2">
                  {link.pathName}
                </button>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
