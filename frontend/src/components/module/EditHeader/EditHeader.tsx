import React from "react";
import { NavLink } from "react-router-dom";

//! components
// import { CustomButton } from "@/components/atomic/Button";
import { LogoutBtn } from "@/components/module/LogoutBtn";

type Props = {
  className?: string;
  // actionBtns: ActionBtnsType[];
};

// type ActionBtnsType = {
//   title: string;
//   form: string;
// };

export const EditHeader = React.memo(({ className }: Props) => {
  const links = [
    { title: "選手登録", link: "/fighter/register" },
    { title: "選手編集", link: "/fighter/edit?page=1" },
    { title: "試合登録", link: "/match/register" },
    { title: "試合編集", link: "/match/delete" },
    { title: "Home", link: "/" },
  ];
  return (
    <>
      <header
        className={`z-10 fixed top-0 left-0 h-[50px] px-5 flex justify-between items-center w-full bg-stone-800 ${className}`}
      >
        <nav className="">
          {links.map((el) => (
            <NavLink
              key={el.title}
              className={({ isActive }) =>
                isActive
                  ? `text-stone-200 border-b border-stone-200 first:ml-0 ml-5 pb-1`
                  : `text-stone-200 first:ml-0 ml-5 pb-1`
              }
              to={el.link}
            >
              {el.title}
            </NavLink>
          ))}
        </nav>
        <LogoutBtn />
      </header>
    </>
  );
});
