import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
// ? リンク先
const linksArray = [
  { pathName: "Home", path: "/" },
  { pathName: "ボクサー登録", path: "/admini/boxer_register" },
  { pathName: "ボクサー編集", path: "/admini/boxer_edit" },
  { pathName: "試合登録", path: "/admini/match_register" },
];

export const LinkList = () => {
  const currentPage = location.pathname;
  return (
    <div className="flex justify-center items-center h-[100px] w-full">
      <ul className="flex">
        {linksArray.map((link) => (
          <li key={`${link.pathName}_${link.path}`} className="mr-5">
            {currentPage === link.path ? (
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
