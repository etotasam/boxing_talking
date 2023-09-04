import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
// ! components
import { Button } from "@/components/atomc/Button";
// components
// import { EditHeader } from "@/components/module/EditHeader";

export const AdminiLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
};

const Header = () => {
  // ? 現在のパス
  const currentPage = location.pathname;

  // ? リンク先
  const linkArray = [
    { pathName: "Home", path: "/" },
    { pathName: "ボクサー登録", path: "/admini/boxer_register" },
  ];

  return (
    <div className="flex justify-center items-center h-[100px] w-full">
      <ul className="flex">
        {linkArray.map(
          (link) =>
            currentPage !== link.path && (
              <li key={`${link.pathName}_${link.path}`} className="mr-5">
                <Link to={link.path}>
                  <Button>{link.pathName}</Button>
                </Link>
              </li>
            )
        )}
      </ul>
    </div>
  );
};
