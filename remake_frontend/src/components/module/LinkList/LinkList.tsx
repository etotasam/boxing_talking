import React, { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
//! data
import { linksArray } from "@/assets/pathLinks";
//! hooks
import { usePagePath } from "@/hooks/usePagePath";

export const LinkList = () => {
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
