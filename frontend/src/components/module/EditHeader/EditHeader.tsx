import React from "react";
import { NavLink } from "react-router-dom";

import { CustomButton } from "@/components/atomic/Button";

type Props = {
  className?: string;
  // actionBtns: ActionBtnsType[];
};

type ActionBtnsType = {
  title: string;
  form: string;
};

export const EditHeader = React.memo(({ className }: Props) => {
  const links = [
    { title: "選手編集", link: "/fighter/edit" },
    { title: "選手登録", link: "/fighter/register" },
    { title: "試合登録", link: "/match/register" },
    { title: "試合削除", link: "/match/delete" },
  ];
  return (
    <>
      <header className={`z-10 fixed top-0 left-0 h-[50px] flex items-center w-full bg-stone-800 ${className}`}>
        <nav className="">
          {links.map((el) => (
            <NavLink
              key={el.title}
              className={({ isActive }) =>
                isActive ? `text-stone-200 border-b border-stone-200 ml-5` : `text-stone-200 ml-5`
              }
              to={el.link}
            >
              {el.title}
            </NavLink>
          ))}
        </nav>
        {/* <div className="flex items-center px-5 bg-stone-600 w-full h-[50px]">
          {actionBtns.map((el) => (
            <CustomButton form={el.form} className="bg-gray-300">
              {el.title}
            </CustomButton>
          ))}
        </div> */}
      </header>
    </>
  );
});
